from rest_framework import serializers

class RegistroSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=5)
    name = serializers.CharField(max_length=150, required=False)

class VerificacionTokenSerializer(serializers.Serializer):
    idToken = serializers.CharField()
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class GoogleLoginSerializer(serializers.Serializer):
    idToken = serializers.CharField()
    
#class LogoutSerializer(serializers.Serializer):
    #message = serializers.CharField(read_only=True, default="Sesión cerrada")