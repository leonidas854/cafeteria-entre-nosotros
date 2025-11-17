from rest_framework import serializers
from .models import UsuarioBase,Producto,Bebida,Comida

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

class LoginSerializer(serializers.Serializer):
    username=serializers.CharField(required =True)
    password=serializers.CharField(write_only=True,
                                   required=True)
class LoginSuccessResponseSerializer(serializers.Serializer):
    message = serializers.CharField()
class ErrorResponseSerializer(serializers.Serializer):
    error = serializers.CharField()
class LogoutSuccessResponseSerializer(serializers.Serializer):
    isSuccess = serializers.BooleanField()
    message = serializers.CharField()
class ProductoSerializer(serializers.ModelSerializer):
    pass

