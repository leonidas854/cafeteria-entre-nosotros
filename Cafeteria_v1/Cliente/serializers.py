from rest_framework import serializers

from Admin.serializers import UsuarioBaseSerializer
from .models import Cliente, Detalle_pedido, Extra
from .google_maps import get_direccion



class ClienteSerializer(serializers.ModelSerializer):
    user = UsuarioBaseSerializer()
    class Meta:
        model = Cliente
        fields = ['user','apell_materno','telefono','nit','ubicacion','latitud', 'longitud']
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user_data['tipo'] = 'cliente'
        user = UsuarioBaseSerializer().create(user_data)
        if 'latitud' in validated_data and 'longitud' in validated_data:
            validated_data['ubicacion'] = get_direccion(
                validated_data['latitud'],
                validated_data['longitud']
            )
        cliente = Cliente.objects.create(user=user, **validated_data)
        return cliente
        
