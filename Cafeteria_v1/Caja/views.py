from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import viewsets
# Create your views here.
from .serializers import EmpleadoSerializer
from .models import Empleado

from rest_framework.decorators import api_view, permission_classes

from rest_framework.permissions import AllowAny
from rest_framework.response import Response



class EmpleadoViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer