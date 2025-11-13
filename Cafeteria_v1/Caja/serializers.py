from rest_framework import serializers

from Admin.serializers import UsuarioBaseSerializer
from .models import Empleado

class EmpleadoSerializer(serializers.ModelSerializer):
    user = UsuarioBaseSerializer
    class Meta:
        model = Empleado
        fields = ['']