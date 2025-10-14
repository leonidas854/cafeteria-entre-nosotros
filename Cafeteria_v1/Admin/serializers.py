from rest_framework import serializers
from .models import UsuarioBase

class UsuarioBaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioBase
        fields = ['id', 'username', 'email', 'password', 'tipo']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = UsuarioBase.objects.create_user(**validated_data)
        return user
