from rest_framework import serializers

from Admin.serializers import UsuarioBaseSerializer
from .models import Empleado

from datetime import datetime,timezone

class EmpleadoSerializer(serializers.ModelSerializer):
    user = UsuarioBaseSerializer()
    class Meta:
        model = Empleado
        fields = ['user','rol','telefono']
    def create(self,validated_data):
        user_data=validated_data.pop('user')
        user_data['tipo']='empleado'
        user = UsuarioBaseSerializer().create(user_data)
        validated_data['fecha_contratacion'] = datetime.now(timezone.utc).date()
        empleado = Empleado.objects.create(user=user,**validated_data)
        return empleado
