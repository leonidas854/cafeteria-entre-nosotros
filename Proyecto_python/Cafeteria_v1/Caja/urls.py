from .views import EmpleadoViewSet,VentaViewSet
from django.urls  import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()


router.register(r'empleados',EmpleadoViewSet,basename = 'empleado')
router.register(r'ventas',VentaViewSet,basename='venta')
urlpatterns = [
    path('',include(router.urls)),

]