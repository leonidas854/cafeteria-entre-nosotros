from django.shortcuts import render

# Create your views here.

from django.contrib.auth import authenticate, login,logout
from rest_framework.decorators import api_view, permission_classes,action
from rest_framework.permissions import AllowAny,IsAuthenticated,IsAdminUser
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser,FormParser
from django.db.models import Prefetch
from rest_framework.pagination import PageNumberPagination
from Cliente.models import Detalle_pedido
from .models import UsuarioBase,Producto,Pedido,Cliente,Promocion
from rest_framework import viewsets
import json
from django.db import transaction
from rest_framework.views import APIView
from django.db import connection
from drf_spectacular.utils import extend_schema
from Caja.models import Empleado

from .models import Pedido, EstadoPedido, TipoEntrega 

from .serializers import (
    ClienteRegistroSerializer,
    LoginSerializer,
    LoginSuccessResponseSerializer,
    ErrorResponseSerializer,
    LogoutSuccessResponseSerializer,
    PedidoDetalladoSerializer,ProductoSerializer,
    PedidoSerializer,PromocionSerializer,PromocionTodoSerializer,
    ClientePorNitSerializer
    
)
from django.http import Http404
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status





@extend_schema(
    summary="Iniciar sesión de usuario",
    description="Autentica a un usuario y crea una sesión.",
    tags=['Autenticación'],
    request=LoginSerializer,
    responses={
        200: LoginSuccessResponseSerializer,
        400: ErrorResponseSerializer
    }
)
#@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    validated_data = serializer.validated_data
    user = authenticate(
        request,
        username=validated_data['username'],
        password=validated_data['password']
    )
    
    if user:
        login(request, user)
        response_data = {
            'message': 'Login correcto',
            'tipo': getattr(user, 'tipo', 'desconocido'),
            'username': user.username
        }

        if user.tipo == 'empleado':
            try:
                empleado_perfil = user.empleado 
                response_data['rol'] = empleado_perfil.rol
            except Empleado.DoesNotExist:
                response_data['rol'] = None
        return Response(response_data, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Credenciales inválidas'},
                         status=status.HTTP_400_BAD_REQUEST)


@extend_schema(
    summary="Cerrar sesión de usuario",
    description="Invalida la sesión del usuario actualmente autenticado.",
    tags=['Autencion'],
    request=None, 
    responses={200: LogoutSuccessResponseSerializer}
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request): 
    logout(request)
    return Response({'isSuccess' : True,
                         'message': 'Sesión cerrada exitosamente'})
@permission_classes([AllowAny])
class ProductoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Producto.objects.select_related('bebida','comida').all()
    serializer_class = ProductoSerializer
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({'request': self.request})
        return context


class PedidoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoDetalladoSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['put'], url_path='cambiar-estado', permission_classes=[IsAuthenticated]) # O IsEmpleadoUser
    @transaction.atomic 
    def cambiar_estado(self, request, pk=None):
        nuevo_estado = request.query_params.get('nuevo_estado', None)
        if not nuevo_estado:
            return Response({"detail": "Debe proporcionar 'nuevo_estado' en los query params."}, status=status.HTTP_400_BAD_REQUEST)

        # === SOLUCIÓN 2: USAR LOS NOMBRES DE CLASE CORRECTOS ===
        valid_estados = [choice[0] for choice in EstadoPedido.choices]
        if nuevo_estado not in valid_estados:
            return Response({"detail": f"'{nuevo_estado}' no es un estado válido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pedido = self.get_object() 
        except Pedido.DoesNotExist:
            return Response({"detail": "Pedido no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        tipo_entrega = pedido.tipo_entrega
        
        transiciones_map = {
            # Usamos los nombres de clase correctos aquí también
            TipoEntrega.MESA: [EstadoPedido.EN_ESPERA, EstadoPedido.PREPARANDO, EstadoPedido.LISTO, EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO],
            TipoEntrega.LLEVAR: [EstadoPedido.EN_ESPERA, EstadoPedido.PREPARANDO, EstadoPedido.LISTO, EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO],
            TipoEntrega.RECOGER: [EstadoPedido.EN_ESPERA, EstadoPedido.PREPARANDO, EstadoPedido.LISTO, EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO],
            TipoEntrega.DELIVERY: [EstadoPedido.EN_ESPERA, EstadoPedido.PREPARANDO, EstadoPedido.LISTO, EstadoPedido.EN_DELIVERY, EstadoPedido.CANCELADO],
            TipoEntrega.DOMICILIO: [EstadoPedido.EN_ESPERA, EstadoPedido.PREPARANDO, EstadoPedido.LISTO, EstadoPedido.EN_DELIVERY, EstadoPedido.CANCELADO],
        }
        transiciones_validas = transiciones_map.get(tipo_entrega, [])

        if nuevo_estado not in transiciones_validas:
            return Response(
                {"detail": f"Transición a '{nuevo_estado}' no válida para el tipo de entrega '{tipo_entrega}'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # El resto de tu lógica es correcta y no necesita cambios
        try:
            if hasattr(pedido, 'venta') and pedido.venta.empleado is None:
                if hasattr(request.user, 'empleado'):
                    pedido.venta.empleado = request.user.empleado
                    pedido.venta.save()
        except Exception as e:
            print(f"Error al intentar asignar empleado a la venta: {e}")

        pedido.estado = nuevo_estado
        pedido.save()

        return Response({
            "mensaje": "Estado actualizado correctamente.",
            "nuevo_estado": pedido.estado
        }, status=status.HTTP_200_OK)

    
    
    @action(detail=False, methods=['get'], url_path='mis-pedidos')
    def mis_pedidos(self, request):
        cliente = Cliente.objects.get(user = request.user)

        pedidos = Pedido.objects.filter(cliente=cliente).prefetch_related(
            'detalle_pedido__producto',
            'detalle_pedido__extras'
        )

        if not pedidos.exists():
            return Response({"detail": "No se encontraron pedidos para este cliente."}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(pedidos, many=True)

        return Response(serializer.data)
    
    
        
    def retrieve(self, request, *args, **kwargs):

        try:
            instance = self.get_object()
        except Http404:
            return Response({"detail": "Pedido no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
  
        if not user.is_staff and instance.cliente.user != user:
            return Response(
                {"detail": "No tienes permiso para ver este pedido."},
                status=status.HTTP_403_FORBIDDEN
            )
 
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class PromocionViewSet(viewsets.ModelViewSet):

    queryset = Promocion.objects.prefetch_related('producto').all()
    serializer_class = PromocionSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    lookup_field = 'nombre'
    lookup_url_kwarg = 'strategykey' 

    def get_permissions(self):
        if self.action in ['list', 'todas', 'retrieve']:
            return [AllowAny()]
        return super().get_permissions()

    def get_object(self):

        queryset = self.filter_queryset(self.get_queryset())
 
        filter_kwargs = {f'nombre__iexact': self.kwargs[self.lookup_url_kwarg]}
        obj = queryset.filter(**filter_kwargs).first()
        if not obj:
            raise Http404("No se encontró la promoción.")
        self.check_object_permissions(self.request, obj)
        return obj


    @action(detail=False, methods=['get'])
    def todas(self, request):
        queryset = self.get_queryset()
 
        serializer = PromocionTodoSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    

class TodosPedidosOptimizadosView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = PageNumberPagination

    def get(self, request, *args, **kwargs):
        paginator = self.pagination_class()
        if not getattr(paginator, 'page_size', None):
             paginator.page_size = 25
        
        page_size = paginator.get_page_size(request)
        page_number = int(request.query_params.get(paginator.page_query_param, 1))
        offset = (page_number - 1) * page_size
        
        query = f"""
            SELECT
                p.id AS id,
                p.total_estimado,
                p.total_descuento,
                p.tipo_entrega,
                p.estado,
                CONCAT('[',
                    COALESCE(
                        GROUP_CONCAT(
                            DISTINCT JSON_OBJECT(
                                'id', dp.id,
                                'producto_id', dp.producto_id,
                                'producto_nombre', prod.nombre,
                                'cantidad', dp.cantidad,
                                'precio_unitario', dp.precio_unitario,
                                'extras', (
                                    SELECT
                                        CONCAT('[',
                                            COALESCE(
                                                GROUP_CONCAT(
                                                    JSON_OBJECT('id', e.id, 'nombre', e.nombre, 'precio', e.precio)
                                                ),
                                            '')
                                        ,']')
                                    FROM Carrito_itemcarrito_extras AS dpe 
                                    JOIN Cliente_extra AS e ON dpe.extra_id = e.id
                                    WHERE dpe.itemcarrito_id = dp.id
                                )
                            )
                        ),
                    '')
                ,']') AS detalles_json
            FROM
                Admin_pedido p
            LEFT JOIN
                Cliente_detalle_pedido dp ON p.id = dp.pedido_id
            LEFT JOIN
                Admin_producto prod ON dp.producto_id = prod.id
            GROUP BY
                p.id
            ORDER BY
                p.id DESC
            LIMIT %s OFFSET %s;
        """

        with connection.cursor() as cursor:
            cursor.execute(query, [page_size, offset])
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        for pedido in results:
            detalles_str = pedido.get('detalles_json')
            if detalles_str:
                try:
            
                    pedido['detalles'] = json.loads(detalles_str.replace('\\"', '"'))
                except json.JSONDecodeError:
                    pedido['detalles'] = []
            else:
                pedido['detalles'] = []
            del pedido['detalles_json'] 

     
        total_count = Pedido.objects.count()
        
        next_url = None
        if (page_number * page_size) < total_count:
            next_url = request.build_absolute_uri(f'?{paginator.page_query_param}={page_number + 1}')

        previous_url = None
        if page_number > 1:
            previous_url = request.build_absolute_uri(f'?{paginator.page_query_param}={page_number - 1}')

        return Response({
            'count': total_count,
            'next': next_url,
            'previous': previous_url,
            'results': results
        })
    
class CajeroViewSet(viewsets.ViewSet):

    permission_classes = [IsAuthenticated] 

    @action(detail=False, methods=['get'], url_path='nit/(?P<nit>\d+)')
    def buscar_cliente_por_nit(self, request, nit=None):
        try:
           
            cliente = Cliente.objects.select_related('user').get(nit=nit)
        except Cliente.DoesNotExist:
            return Response({"detail": "Cliente no encontrado con ese NIT."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = ClientePorNitSerializer(cliente)
        return Response(serializer.data)

   
    @action(detail=False, methods=['put'], url_path='actualizar-apellido/(?P<nit>\d+)')
    def actualizar_apellido_por_nit(self, request, nit=None):
        nuevo_apellido = request.data.get('nuevo_apellido')
        if not nuevo_apellido:
            return Response({"detail": "El campo 'nuevo_apellido' es requerido."}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            cliente = Cliente.objects.select_related('user').get(nit=nit)
        except Cliente.DoesNotExist:
            return Response({"mensaje": "Cliente no encontrado con ese NIT."}, status=status.HTTP_404_NOT_FOUND)

        
        user = cliente.user
        user.last_name = nuevo_apellido
        user.save(update_fields=['last_name'])

        return Response({
            "mensaje": "Apellido actualizado correctamente.",
            "cliente": {
                "id_user": user.id,
                "nit": cliente.nit,
                "apellido_paterno": user.last_name
            }
        })

 
    @action(detail=False, methods=['post'], url_path='registrar-cliente', permission_classes=[AllowAny])
    @transaction.atomic
    def registrar_cliente(self, request):
        serializer = ClienteRegistroSerializer(data=request.data)
        
        if serializer.is_valid():
            cliente_creado = serializer.save()
            
    
            output_serializer = ClientePorNitSerializer(cliente_creado)
            
            return Response({
                "isSuccess": True,
                "cliente": output_serializer.data
            }, status=status.HTTP_201_CREATED)
        
        if 'usuario' in serializer.errors or 'nit' in serializer.errors:
            return Response({"mensaje": serializer.errors}, status=status.HTTP_409_CONFLICT)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)