from Admin.views import login_view,logout_view,ProductoViewSet,PedidoViewSet
from .models import UsuarioBase
from django.urls import path, include

from rest_framework.routers import DefaultRouter
router  = DefaultRouter()
router.register(r'productos',ProductoViewSet,basename='producto')
router.register(r'pedidos', PedidoViewSet, basename='pedido')

urlpatterns = [
    path('login/',login_view,name='login'),
    path('logout/',logout_view),
    path('',include(router.urls))
]
