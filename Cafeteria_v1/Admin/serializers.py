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
class BebidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bebida
        fields = ['tamanio']
class ComidaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comida
        fields = ['proporcion']
class ProductoSerializer(serializers.ModelSerializer):
    #imagen_url = serializers.SerializerMethodField()
    tamanio = serializers.CharField(read_only = True,required = False)
    proporcion = serializers.CharField(read_only = True,required = False)

    class Meta:
        model = Producto
        fields = ['id','tipo','categoria','subcategoria','descripcion','nombre','precio','estado','sabores','imagen','proporcion','tamanio','imagen_url']
    def to_representation(self, instance):
        
        representation = super().to_representation(instance)
        
        request = self.context.get('request')

        ruta_relativa_imagen = instance.imagen_url
        
        if request and ruta_relativa_imagen:
            representation['imagen_url'] = request.build_absolute_uri(ruta_relativa_imagen)
        
        
        if instance.tipo == 'bebida' and hasattr(instance, 'bebida'):
            detalles_bebida = BebidaSerializer(instance.bebida).data
            representation.update(detalles_bebida)
        elif instance.tipo == 'comida' and hasattr(instance, 'comida'):
            detalles_comida = ComidaSerializer(instance.comida).data
            representation.update(detalles_comida)
        return {key: value for key, value in representation.items() if value is not None}
