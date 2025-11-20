from rest_framework.routers import DefaultRouter

from .views import ClienteViewSet,ExtraViewSet
from django.urls import path,include





router = DefaultRouter()
router.register(r'clients',ClienteViewSet,basename = 'clientes')
router.register(r'extras', ExtraViewSet, basename='extra')
urlpatterns = [
    path('',include(router.urls)),

    
    
    
    ]

