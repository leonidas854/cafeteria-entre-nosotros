# serializers.py
from rest_framework import serializers


class DispensarComandoSerializer(serializers.Serializer):
    valvula_id = serializers.IntegerField()
    ml = serializers.IntegerField()


class DispensarProductoSerializer(serializers.Serializer):

    idToken = serializers.CharField()
    producto_id = serializers.CharField() 
    ml = serializers.IntegerField(min_value=1) 
    valvula_id = serializers.IntegerField(min_value=1, max_value=2)