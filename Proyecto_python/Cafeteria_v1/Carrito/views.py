from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .logic import actualizar_promociones_en_items, crear_pedido_desde_carrito, PedidoError

from .models import Carrito, ItemCarrito
from .serializers import (CarritoSerializer,
                           AgregarItemSerializer, ModificarCantidadSerializer,
                           ModificarExtrasSerializer,AsignarClienteSerializer,
                           ConfirmarPedidoSerializer, PedidoConfirmadoSerializer,
                           )



class IsEmpleadoUser(IsAuthenticated):

    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.tipo == 'empleado'

class CarritoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _get_carrito_usuario_actual(self, user):
            """Intenta obtener el carrito activo, no lo crea."""
            carrito = None
            if hasattr(user, 'empleado'):
                carrito = Carrito.objects.filter(empleado=user.empleado).first()
            elif hasattr(user, 'cliente'):
                carrito = Carrito.objects.filter(cliente=user.cliente).first()
            return carrito



    @action(detail=False, methods=['get'], url_path='mi-carrito')
    def obtener_carrito(self, request):
        
        carrito = self._get_carrito_usuario_actual(request.user)

        if not carrito:
            # Si no hay carrito, lo creamos aquí
            if hasattr(request.user, 'empleado'):
                carrito = Carrito.objects.create(empleado=request.user.empleado)
            elif hasattr(request.user, 'cliente'):
                carrito = Carrito.objects.create(cliente=request.user.cliente)
            else:
                 return Response({"detail": "Usuario no autorizado para crear carrito."}, status=status.HTTP_403_FORBIDDEN)

        items_a_procesar = carrito.items.select_related('producto').all()
        items_procesados = actualizar_promociones_en_items(items_a_procesar)
        serializer_context = {'request': request, 'items_procesados': items_procesados}
        serializer = CarritoSerializer(carrito, context=serializer_context)
        return Response(serializer.data)


    @action(detail=False, methods=['post'], url_path='agregar-item')
    @transaction.atomic 
    def agregar_item(self, request):
        input_serializer = AgregarItemSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = input_serializer.validated_data
        carrito = self._get_carrito_usuario_actual(request.user)
        

        item_existente = None
        for item in carrito.items.filter(producto=data['producto_id']):
            extras_actuales = set(item.extras.values_list('id', flat=True))
            extras_nuevos = set(e.id for e in data.get('extra_ids', []))
            if extras_actuales == extras_nuevos:
                item_existente = item
                break

        if item_existente:
            item_existente.cantidad += data['cantidad']
            item_existente.save()
        else:
            nuevo_item = ItemCarrito.objects.create(
                carrito=carrito,
                producto=data['producto_id'],
                cantidad=data['cantidad']
            )
            if data.get('extra_ids'):
                nuevo_item.extras.set(data['extra_ids'])
        
        return self.obtener_carrito(request) 


    @action(detail=False, methods=['put'], url_path='modificar-cantidad')
    def modificar_cantidad(self, request):
        input_serializer = ModificarCantidadSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = input_serializer.validated_data
        item = data['item_id']
        
     
        carrito = self._get_carrito_usuario_actual(request.user)
        if item.carrito != carrito:
            return Response({"detail": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)

        if data['nueva_cantidad'] >= 0:
            item.cantidad = data['nueva_cantidad']
            item.save()
        else:
            item.delete() 

        return self.obtener_carrito(request)
    
    @action(detail=True, methods=['put'], url_path='asignar-a-cliente', permission_classes=[IsEmpleadoUser])
    @transaction.atomic
    def asignar_a_cliente(self, request, pk=None):

        input_serializer = AsignarClienteSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        cliente_a_asignar = input_serializer.validated_data['cliente_id']

        try:
    
            carrito_a_actualizar = Carrito.objects.get(pk=pk, empleado=request.user.empleado)
        except Carrito.DoesNotExist:
            return Response({"detail": "Carrito no encontrado o no pertenece a este empleado."}, status=status.HTTP_404_NOT_FOUND)
        
        carrito_antiguo_cliente = Carrito.objects.filter(cliente=cliente_a_asignar).first()
        if carrito_antiguo_cliente:
            carrito_antiguo_cliente.delete()


        carrito_a_actualizar.cliente = cliente_a_asignar
        carrito_a_actualizar.empleado = None
        carrito_a_actualizar.save()

     
        serializer = CarritoSerializer(carrito_a_actualizar)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['delete'], url_path=r'quitar-item/(?P<item_id>\d+)')
    def quitar_item(self, request, item_id=None):
        carrito = self._get_carrito_usuario_actual(request.user)
        try:
            item = carrito.items.get(id=item_id)
            item.delete()
        except ItemCarrito.DoesNotExist:
            return Response({"detail": "Item no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
        return self.obtener_carrito(request)


    @action(detail=False, methods=['delete'], url_path='vaciar-carrito')
    def vaciar_carrito(self, request):
        carrito = self._get_carrito_usuario_actual(request.user)
        carrito.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


    @action(detail=False, methods=['put'], url_path='modificar-extras')
    @transaction.atomic
    def modificar_extras(self, request):
        input_serializer = ModificarExtrasSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = input_serializer.validated_data
        item = data['item_id']
        
        carrito = self._get_carrito_usuario_actual(request.user)
        if item.carrito != carrito:
            return Response({"detail": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)

        item.extras.set(data['nuevos_extra_ids'])
        

        items_procesados = actualizar_promociones_en_items(list(carrito.items.select_related('producto').all()))
        serializer = CarritoSerializer(carrito, context={'items': items_procesados}) # Pasamos los items procesados
        return Response(serializer.data)

    @action(detail=True, methods=['put'], url_path='asignar-a-cliente', permission_classes=[IsEmpleadoUser])
    @transaction.atomic
    def asignar_a_cliente(self, request, pk=None):
        input_serializer = AsignarClienteSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        cliente_a_asignar = input_serializer.validated_data['cliente_id']

        try:
      
            carrito_a_actualizar = Carrito.objects.get(pk=pk, empleado=request.user.empleado)
        except Carrito.DoesNotExist:
            return Response({"detail": "Carrito no encontrado o no pertenece a este empleado."}, status=status.HTTP_404_NOT_FOUND)
     
        carrito_a_actualizar.cliente = cliente_a_asignar
        carrito_a_actualizar.save()

     
        serializer = CarritoSerializer(carrito_a_actualizar)
        return Response(serializer.data, status=status.HTTP_200_OK)
    @action(detail=False, methods=['post'], url_path='confirmar-pedido')
    def confirmar_pedido(self, request):
        input_serializer = ConfirmarPedidoSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = input_serializer.validated_data
        
        try:
            pedido_creado = crear_pedido_desde_carrito(
                carrito_id=data['carrito_id'],
                tipo_entrega=data['tipo_entrega'],
                tipo_pago=data['tipo_pago']
            )
            
            output_serializer = PedidoConfirmadoSerializer(pedido_creado)
            return Response(output_serializer.data, status=status.HTTP_200_OK)

        except PedidoError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:

            print(e) 
            return Response({"detail": "Error interno al confirmar el pedido."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
