from rest_framework.routers import DefaultRouter

from .views import ClienteViewSet
from django.urls import path,include





router = DefaultRouter()
router.register(r'clients',ClienteViewSet,basename = 'clientes')

urlpatterns = [
    path('',include(router.urls)),

    
    
    
    ]

