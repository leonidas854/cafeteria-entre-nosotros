from django.shortcuts import render
from django.contrib.auth import authenticate,login,logout,get_user_model
# Create your views here.

from rest_framework import viewsets

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


from .models import Cliente, Pedido, Detalle_pedido, Extra
from .serializers import ClienteSerializer
from Caja.models import Empleado
from Admin.models import UsuarioBase

#@permission_classes([AllowAny])
class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    


