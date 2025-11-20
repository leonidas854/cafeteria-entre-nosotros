from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .logic import actualizar_promociones_en_items

from .models import Carrito, ItemCarrito
from .serializers import (CarritoSerializer,
                           AgregarItemSerializer, ModificarCantidadSerializer,
                           ModificarExtrasSerializer,AsignarClienteSerializer)

def _get_o_crear_carrito_usuario(user):
    if user.tipo == 'cliente':
        carrito, created = Carrito.objects.get_or_create(cliente=user.cliente)
    elif user.tipo == 'empleado':
        carrito, created = Carrito.objects.get_or_create(empleado=user.empleado)
    else:
        raise PermissionError("Rol de usuario no válido para carrito.")
    return carrito


class CarritoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]


    @action(detail=False, methods=['get'], url_path='mi-carrito')
    def obtener_carrito(self, request):
        try:
            carrito = _get_o_crear_carrito_usuario(request.user)
        except (AttributeError, PermissionError):
            return Response({"detail": "Usuario o rol no válido."}, status=status.HTTP_403_FORBIDDEN)

        items_a_procesar = carrito.items.select_related('producto').all()
        items_procesados = actualizar_promociones_en_items(items_a_procesar)

        serializer_context = {
            'request': request,
            'items_procesados': items_procesados
        }
        serializer = CarritoSerializer(carrito, context=serializer_context)
        return Response(serializer.data)


    @action(detail=False, methods=['post'], url_path='agregar-item')
    @transaction.atomic 
    def agregar_item(self, request):
        input_serializer = AgregarItemSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = input_serializer.validated_data
        carrito = _get_o_crear_carrito_usuario(request.user)
        

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
        
     
        carrito = _get_o_crear_carrito_usuario(request.user)
        if item.carrito != carrito:
            return Response({"detail": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)

        if data['nueva_cantidad'] > 0:
            item.cantidad = data['nueva_cantidad']
            item.save()
        else:
            item.delete() 

        return self.obtener_carrito(request)


    @action(detail=False, methods=['delete'], url_path='quitar-item/(?P<item_id>\d+)')
    def quitar_item(self, request, item_id=None):
        carrito = _get_o_crear_carrito_usuario(request.user)
        try:
            item = carrito.items.get(id=item_id)
            item.delete()
        except ItemCarrito.DoesNotExist:
            return Response({"detail": "Item no encontrado."}, status=status.HTTP_404_NOT_FOUND)
        
        return self.obtener_carrito(request)


    @action(detail=False, methods=['delete'], url_path='vaciar-carrito')
    def vaciar_carrito(self, request):
        carrito = _get_o_crear_carrito_usuario(request.user)
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
        
        carrito = _get_o_crear_carrito_usuario(request.user)
        if item.carrito != carrito:
            return Response({"detail": "No autorizado."}, status=status.HTTP_403_FORBIDDEN)

        item.extras.set(data['nuevos_extra_ids'])
        

        items_procesados = actualizar_promociones_en_items(list(carrito.items.select_related('producto').all()))
        serializer = CarritoSerializer(carrito, context={'items': items_procesados}) # Pasamos los items procesados
        return Response(serializer.data)

    @action(detail=True, methods=['put'], url_path='asignar-cliente')
    def asignar_cliente(self, request, pk=None):
        try:
            carrito_empleado = Carrito.objects.get(pk=pk, empleado__isnull=False)
        except Carrito.DoesNotExist:
            return Response({"detail": "Carrito no encontrado o no pertenece a un empleado."}, status=status.HTTP_404_NOT_FOUND)

        input_serializer = AsignarClienteSerializer(data=request.data)
        if not input_serializer.is_valid():
            return Response(input_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        cliente_a_asignar = input_serializer.validated_data['cliente_id']
        

        with transaction.atomic():
            carrito_cliente, created = Carrito.objects.get_or_create(cliente=cliente_a_asignar)
            
            for item in carrito_empleado.items.all():

                item.carrito = carrito_cliente
                item.save()
            
            carrito_empleado.delete()

        items_procesados = actualizar_promociones_en_items(list(carrito_cliente.items.select_related('producto').all()))
        serializer = CarritoSerializer(carrito_cliente, context={'items': items_procesados})
        return Response(serializer.data)