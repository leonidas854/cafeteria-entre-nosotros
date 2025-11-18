from Admin.views import login_view,logout_view,ProductoViewSet
from .models import UsuarioBase
from django.urls import path, include

from rest_framework.routers import DefaultRouter
router  = DefaultRouter()
router.register(r'productos',ProductoViewSet,basename='producto')

urlpatterns = [
    
    path('login/',login_view,name='login'),
    path('logout/',logout_view),
    path('',include(router.urls))
    
    
]
