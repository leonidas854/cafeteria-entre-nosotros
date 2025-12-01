from rest_framework import serializers
from .models import UsuarioBase,Producto,Bebida,Comida,Pedido,Promocion,Cliente
from Cliente.models import Detalle_pedido,Extra
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

            
        return representation
    

class ExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Extra
        fields= ['id','nombre','precio']

class DetallePedidoSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source = 'producto.nombre',read_only=True)
    extras = ExtraSerializer(many=True,read_only=True)

    class Meta:
        model =Detalle_pedido
        fields = ['producto_id','producto_nombre','cantidad','precio_unitario','extras']


class PedidoSerializer(serializers.ModelSerializer):
    tipo_entrega = serializers.CharField(source='get_tipo_entrega_display')
    estado = serializers.CharField(source = 'get_estado_display')

    detalles = DetallePedidoSerializer(source = 'detalle_pedido',many=True,read_only=True)

    class Meta:
        model =Pedido
        fields = ['id',
                  'total_estimado',
                  'total_descuento',
                  'tipo_entrega',
                  'estado',
                  'detalles']


class PromocionSerializer(serializers.ModelSerializer):
    
    strategykey = serializers.CharField(source='nombre')

    fecha_final = serializers.DateField(source='fech_final')


    fech_ini = serializers.DateField(source='fecha_ini')


    imagen = serializers.ImageField(source='image', write_only=True, required=False)

    full_image_url = serializers.SerializerMethodField(read_only=True)
    

    productos = serializers.PrimaryKeyRelatedField(
        source='producto', queryset=Producto.objects.all(), many=True
    )

    class Meta:
        model = Promocion

        fields = [
            'id', 'strategykey', 'descuento', 'fech_ini', 'fecha_final',
            'descripcion', 'productos', 'imagen', 'full_image_url'
        ]

    def get_full_image_url(self, obj):
        request = self.context.get('request')
 
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)

        if obj.url_imagen:
            return request.build_absolute_uri(obj.url_imagen)
        return None

    def validate_nombre(self, value):

        instance = self.instance
        query = Promocion.objects.filter(nombre__iexact=value)
        if instance:
            query = query.exclude(pk=instance.pk)
        if query.exists():
            raise serializers.ValidationError("Ya existe una promoción con ese nombre (Strategykey).")
        return value

class PromocionTodoSerializer(serializers.ModelSerializer):

    strategykey = serializers.CharField(source='nombre')
    fecha_final = serializers.DateField(source='fech_final')
    fech_ini = serializers.DateField(source='fecha_ini')
    full_image_url = serializers.SerializerMethodField(read_only=True)
    

    productos = ProductoSerializer(source='producto', many=True, read_only=True)

    class Meta:
        model = Promocion
        fields = [
            'id', 'strategykey', 'descuento', 'fech_ini', 'fecha_final',
            'descripcion', 'full_image_url', 'productos'
        ]
        
    def get_full_image_url(self, obj):

        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            return request.build_absolute_uri(obj.image.url)
        if obj.url_imagen:
            if obj.url_imagen.startswith('http'):
                return obj.url_imagen
            return request.build_absolute_uri(obj.url_imagen)
        return None



class PedidoDetalladoSerializer(serializers.ModelSerializer):
    tipo_entrega = serializers.CharField(source='get_tipo_entrega_display')
    estado = serializers.CharField(source='get_estado_display')
    detalles = DetallePedidoSerializer(many=True, source='detalle_pedido') 

    class Meta:
        model = Pedido
        fields = ['id', 'total_estimado', 'total_descuento', 'tipo_entrega', 'estado', 'detalles']


class ClientePorNitSerializer(serializers.ModelSerializer):
    
    id = serializers.IntegerField(source='user.id', read_only=True)
    apell_paterno = serializers.CharField(source='user.last_name', read_only=True)
    usuario = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Cliente
        fields = ['id', 'apell_paterno', 'nit', 'usuario']

class ClienteRegistroSerializer(serializers.Serializer):
    apell_paterno = serializers.CharField(max_length=150)
    nit = serializers.IntegerField()
    usuario = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)

    def validate_usuario(self, value):
        
        if UsuarioBase.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("El nombre de usuario ya está en uso.")
        return value

    def validate_nit(self, value):
        
        if Cliente.objects.filter(nit=value).exists():
            raise serializers.ValidationError("Ya existe un cliente con ese NIT.")
        return value

    def create(self, validated_data):
        
        user = UsuarioBase.objects.create_user(
            username=validated_data['usuario'],
            password=validated_data['password'],
            last_name=validated_data['apell_paterno'],
            tipo='cliente' 
    )

        
        cliente = Cliente.objects.create(
            user=user,
            nit=validated_data['nit']
        )
        return cliente