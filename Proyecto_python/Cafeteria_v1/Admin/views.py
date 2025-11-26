from django.shortcuts import render

# Create your views here.

from django.contrib.auth import authenticate, login,logout
from rest_framework.decorators import api_view, permission_classes,action
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser,FormParser
from .models import UsuarioBase,Producto,Pedido,Cliente,Promocion
from rest_framework import viewsets

from drf_spectacular.utils import extend_schema

from .serializers import (
    LoginSerializer,
    LoginSuccessResponseSerializer,
    ErrorResponseSerializer,
    LogoutSuccessResponseSerializer,ProductoSerializer,PedidoSerializer,PromocionSerializer,PromocionTodoSerializer
    
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
    serializer_class = PedidoSerializer

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Pedido.objects.filter(cliente = self.request.user)
    
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