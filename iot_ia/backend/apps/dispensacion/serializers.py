
from rest_framework import serializers

class ProductoRecomendadoSerializer(serializers.Serializer):
    id_producto = serializers.IntegerField()
    nombre = serializers.CharField()
    categoria = serializers.CharField()
    precio = serializers.IntegerField()
    imagen = serializers.CharField()
    score_ia = serializers.FloatField(required=False, default=0.0)