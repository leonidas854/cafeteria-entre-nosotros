from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from firebase_admin import auth as firebase_auth
from rest_framework.permissions import AllowAny
from firebase.firebase_init import db
from .serializers import (
    RegistroSerializer,
    VerificacionTokenSerializer,
    LoginSerializer,
    GoogleLoginSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiResponse
import requests


class RegistroView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    @extend_schema(
        request=RegistroSerializer,
        responses={201: OpenApiResponse(description='Usuario creado')}
    )
    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"] # type: ignore
        password = serializer.validated_data["password"] # type: ignore
        name = serializer.validated_data.get("name", "") # type: ignore

        try:
            user = firebase_auth.create_user(
                email=email,
                password=password,
                display_name=name
            )

            db.collection("usuarios").document(user.uid).set({
                "email": email,
                "name": name,
                "password":password,
                "saldo": 0,
            })

            return Response({"uid": user.uid}, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VerificarTokenLogin(APIView):
    permission_classes = [AllowAny]  

    @extend_schema(
        request=VerificacionTokenSerializer,
        responses={200: OpenApiResponse(description='Token válido')}
    )
    def post(self, request):
        serializer = VerificacionTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        id_token = serializer.validated_data["idToken"] # type: ignore

        try:
            decoded = firebase_auth.verify_id_token(id_token)
            return Response({
                "uid": decoded["uid"],
                "email": decoded.get("email")
            })

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        
class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={200: OpenApiResponse(description="Login exitoso")}
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]  # type: ignore
        password = serializer.validated_data["password"] # type: ignore

        try:
            url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={'AIzaSyC3J3Cqen8SY8QXln6L8NhTRRYoSvpcx-s'}"

            payload = {
                "email": email,
                "password": password,
                "returnSecureToken": True
            }

            resp = requests.post(url, json=payload)
            data = resp.json()

            if "idToken" not in data:
                return Response({"error": data.get("error")}, status=400)

            # Leer Firestore
            user_data = db.collection("usuarios").document(data["localId"]).get().to_dict()

            return Response({
                "uid": data["localId"],
                "idToken": data["idToken"],
                "refreshToken": data["refreshToken"],
                "profile": user_data
            })

        except Exception as e:
            return Response({"error": str(e)}, status=400)
        
        
class MeView(APIView):
    @extend_schema(
        responses={200: OpenApiResponse(description="Perfil del usuario")}
    )
    def get(self, request):
        
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return Response({"error": "Token requerido"}, status=401)

        try:
            token = auth_header.split(" ")[1]
            decoded = firebase_auth.verify_id_token(token)

            uid = decoded["uid"]
            user_data = db.collection("usuarios").document(uid).get().to_dict()

            return Response({
                "uid": uid,
                "email": decoded.get("email"),
                "profile": user_data
            })

        except Exception as e:
            return Response({"error": str(e)}, status=401)

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=GoogleLoginSerializer,
        responses={200: OpenApiResponse(description="Login con Google exitoso")}
    )
    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        id_token = serializer.validated_data["idToken"] # type: ignore

        try:
            decoded = firebase_auth.verify_id_token(id_token)
            uid = decoded["uid"]

            # Si el usuario no existe en Firestore, se crea
            user_ref = db.collection("usuarios").document(uid)
            if not user_ref.get().exists:
                user_ref.set({
                    "email": decoded.get("email"),
                    "name": decoded.get("name", ""),
                    "saldo": 0
                })

            return Response({
                "uid": uid,
                "email": decoded.get("email"),
                "name": decoded.get("name"),
            })

        except Exception as e:
            return Response({"error": str(e)}, status=400)
        
#class LogoutView(APIView):
    #permission_classes = [AllowAny]

    #@extend_schema(
        #request=None,
        #responses={
            #200: OpenApiResponse(description="Sesión cerrada exitosamente"),
            #401: OpenApiResponse(description="Token no proporcionado o inválido")
        #},
        #parameters=[
            #OpenApiParameter(
                #name='Authorization',
                #description='Bearer Token',
                #required=True,
                #type=str,
                #location=OpenApiParameter.HEADER,
            #)
        #]
    #)
    #def post(self, request):
        # DEBUG: Verificar qué está llegando
        #print("🔍 === DEBUG HEADERS ===")
        #for header, value in request.headers.items():
            #print(f"   {header}: {value}")
        
        #auth_header = request.headers.get("Authorization")
        #print(f"🔍 Authorization header recibido: '{auth_header}'")
        #print("🔍 =====================")

        #if not auth_header:
            #print("❌ No se recibió header Authorization")
            #return Response({"error": "Token requerido"}, status=status.HTTP_401_UNAUTHORIZED)

        #try:
            # Verificar que empiece con 'Bearer '
            #if not auth_header.startswith('Bearer '):
                #print(f"❌ Formato incorrecto. Header: '{auth_header}'")
                #return Response({"error": "Formato de token inválido. Use: Bearer <token>"}, 
                              #status=status.HTTP_401_UNAUTHORIZED)

            #token = auth_header.split(" ")[1]
            #print(f"✅ Token extraído: {token[:20]}...")
            
            # Verificar token con Firebase
            #decoded = firebase_auth.verify_id_token(token)
            #uid = decoded["uid"]
            #print(f"✅ Token válido para usuario: {uid}")

            # Revocar tokens
            #firebase_auth.revoke_refresh_tokens(uid)
            #print(f"✅ Tokens revocados para: {uid}")
            
            #return Response({
                #"message": "Sesión cerrada exitosamente",
                #"uid": uid
            #}, status=status.HTTP_200_OK)

        #except Exception as e:
            #print(f"❌ Error en logout: {str(e)}")
            #return Response({"error": f"Error en logout: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
