from django.shortcuts import render

# Create your views here.

from django.contrib.auth import authenticate, login
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import UsuarioBase

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)
    if user:
        login(request, user)
        return Response({
            'message': 'Login correcto',
            'tipo': user.tipo,
            'username': user.username
        })
    else:
        return Response({'error': 'Credenciales inválidas'}, status=400)


@api_view(['POST'])
def logout(request):
    logout(request)
    return Response({'isSuccess' : True,
                         'message': 'Sesión cerrada exitosamente'})