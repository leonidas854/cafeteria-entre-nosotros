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
from rest_framework.views import APIView
from django.db import connection
from drf_spectacular.utils import extend_schema

from .serializers import (
    LoginSerializer,
    LoginSuccessResponseSerializer,
    ErrorResponseSerializer,
    LogoutSuccessResponseSerializer,
    PedidoDetalladoSerializer,ProductoSerializer,PedidoSerializer,PromocionSerializer,PromocionTodoSerializer
    
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
    permission_classes = [IsAdminUser]
    pagination_class = PageNumberPagination

    def get(self, request, *args, **kwargs):
        paginator = self.pagination_class()
        
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