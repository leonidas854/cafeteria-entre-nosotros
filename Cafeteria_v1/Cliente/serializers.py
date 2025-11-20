from rest_framework import serializers

from Admin.serializers import UsuarioBaseSerializer
from .models import Detalle_pedido, Extra
from .google_maps import get_direccion
from Admin.models import Cliente


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

class ExtraSerializer(serializers.ModelSerializer):

    
    class Meta:
        model = Extra
        fields = ['id', 'nombre', 'precio']

    def validate_nombre(self, value):


        instance = self.instance
        
        query = Extra.objects.filter(name__iexact=value)
        
        if instance:
            query = query.exclude(pk=instance.pk)
            

        if query.exists():
            raise serializers.ValidationError("Ya existe un Extra con ese nombre.")
            
        return value
        
