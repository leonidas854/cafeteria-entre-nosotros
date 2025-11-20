from rest_framework import serializers

from Admin.serializers import UsuarioBaseSerializer
from .models import Empleado,Venta

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
class VentaSerializer(serializers.ModelSerializer):
    pedido_id = serializers.IntegerField(source='pedido.id')
    tipo_entrega = serializers.CharField(source='pedido.get_tipo_entrega_display')
    estado_pedido = serializers.CharField(source='pedido.get_estado_display')
    class Meta:
        model = Venta
        fields = [
            'id',
            'total',
            'fecha',
            'tipo_de_pago',
            'pedido_id',
            'tipo_entrega',
            'estado_pedido',
        ]