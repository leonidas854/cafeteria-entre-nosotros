from rest_framework import serializers
from .models import Recarga


class RecargaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recarga
        fields = '__all__'