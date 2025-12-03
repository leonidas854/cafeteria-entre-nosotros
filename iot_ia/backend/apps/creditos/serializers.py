from rest_framework import serializers


class RecargaRequestSerializer(serializers.Serializer):
    uid = serializers.CharField(max_length=128, help_text="ID de Firebase del usuario.")
    monto = serializers.DecimalField(max_digits=10, decimal_places=2, help_text="Monto a recargar.")

class TransaccionSerializer(serializers.Serializer):
    uid = serializers.CharField()
    tipo = serializers.ChoiceField(choices=["recarga", "gasto"])
    monto = serializers.DecimalField(max_digits=10, decimal_places=2)
    descripcion = serializers.CharField()
    producto_id = serializers.IntegerField(required=False)