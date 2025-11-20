from rest_framework import serializers
from .models import Carrito, ItemCarrito
from Admin.models import  Producto,Cliente
from Admin.serializers import ExtraSerializer 
from Cliente.models import Extra



class ItemCarritoSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='producto.nombre', read_only=True)
    categoria = serializers.CharField(source='producto.categoria', read_only=True)
    precio_unitario = serializers.FloatField(source='producto.precio', read_only=True)
    extras = ExtraSerializer(many=True, read_only=True)

    tiene_promocion = serializers.SerializerMethodField()
    precio_promocional = serializers.SerializerMethodField()
    descripcion_promocion = serializers.SerializerMethodField()

    class Meta:
        model = ItemCarrito
        fields = [
            'id', 'producto_id', 'nombre', 'categoria', 'precio_unitario', 
            'cantidad', 'extras', 'tiene_promocion', 'precio_promocional', 
            'descripcion_promocion'
        ]

    def get_tiene_promocion(self, obj):
        return self.context.get('promociones', {}).get(obj.id, {}).get('tiene_promocion', False)

    def get_precio_promocional(self, obj):
        return self.context.get('promociones', {}).get(obj.id, {}).get('precio_promocional')

    def get_descripcion_promocion(self, obj):
        return self.context.get('promociones', {}).get(obj.id, {}).get('descripcion_promocion')


class CarritoSerializer(serializers.ModelSerializer):
    items = ItemCarritoSerializer(many=True, read_only=True)
    
    class Meta:
        model = Carrito
        fields = ['id', 'cliente_id', 'empleado_id', 'items']
    
    def get_items(self, obj):

        items_procesados = self.context.get('items')
        if items_procesados is not None:

            promociones_context = self.context.get('promociones', {})
            return ItemCarritoSerializer(items_procesados, many=True, context={'promociones': promociones_context}).data
        

        return ItemCarritoSerializer(obj.items.all(), many=True, context=self.context).data



class AgregarItemSerializer(serializers.Serializer):
    producto_id = serializers.PrimaryKeyRelatedField(queryset=Producto.objects.all())
    cantidad = serializers.IntegerField(min_value=1)
    extra_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Extra.objects.all()),
        required=False 
    )

class ModificarCantidadSerializer(serializers.Serializer):
    item_id = serializers.PrimaryKeyRelatedField(queryset=ItemCarrito.objects.all())
    nueva_cantidad = serializers.IntegerField(min_value=0) 


class ModificarExtrasSerializer(serializers.Serializer):
    item_id = serializers.PrimaryKeyRelatedField(queryset=ItemCarrito.objects.all())
    nuevos_extra_ids = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Extra.objects.all()), allow_empty=True
    )

class AsignarClienteSerializer(serializers.Serializer):
    cliente_id = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all())