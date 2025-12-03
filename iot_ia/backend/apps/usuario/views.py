from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from firebase_admin.auth import verify_id_token

from django.conf import settings
from rest_framework.response import Response
from rest_framework import status
from firebase_admin import auth as firebase_auth
from rest_framework.permissions import AllowAny
from firebase.firebase_init import firestore_db
from .serializers import (
    RegistroSerializer,
    VerificacionTokenSerializer,
    LoginSerializer,
    GoogleLoginSerializer,
)
from drf_spectacular.utils import extend_schema, OpenApiResponse
import requests
import datetime

#from apps.creditos.serializers import TransaccionSerializer

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

            firestore_db.collection("usuarios").document(user.uid).set({
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
            user_data = firestore_db.collection("usuarios").document(data["localId"]).get().to_dict()

            return Response({
                "uid": data["localId"],
                "idToken": data["idToken"],
                "refreshToken": data["refreshToken"],
                "profile": user_data
            })

        except Exception as e:
            return Response({"error": str(e)}, status=400)
        
        
class MeView(APIView):
    permission_classes = [AllowAny]
    @extend_schema(
        description="Devuelve el perfil completo del usuario a partir de su idToken enviado en el cuerpo de la petición.",
     
        request=VerificacionTokenSerializer,
        responses={200: OpenApiResponse(description="Perfil completo del usuario")}
    )
    def post(self, request): 
        serializer = VerificacionTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
           
            token = serializer.validated_data['idToken']
            decoded_token = verify_id_token(token)
            uid = decoded_token["uid"]

            
            user_doc = firestore_db.collection("usuarios").document(uid).get()
            if not user_doc.exists:
                return Response({"error": "Usuario no encontrado en la base de datos."}, status=status.HTTP_404_NOT_FOUND)
            
            user_profile = user_doc.to_dict()

           
            transacciones_query = firestore_db.collection('transacciones').where('uid', '==', uid).order_by('timestamp', direction='DESCENDING').limit(20)
            transacciones_docs = transacciones_query.stream()
            
            historial = []
            for doc in transacciones_docs:
                transaccion_data = doc.to_dict()
                transaccion_data['id'] = doc.id
                
                
                try:
                    timestamp_str = transaccion_data.get("timestamp")
                    if timestamp_str:
                        
                        dt_object = datetime.datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
                       
                        transaccion_data["timestamp"] = dt_object.isoformat()
                except (ValueError, TypeError):
                   
                    pass
             
                
                historial.append(transaccion_data)


            return Response({
                "uid": uid,
                "email": decoded_token.get("email"),
                "name": user_profile.get("name"),
                "saldo": user_profile.get("saldo", 0),
                "historial_transacciones": historial
            })

        except Exception as e:
            return Response({"error": f"Ocurrió un error inesperado: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=GoogleLoginSerializer,
        responses={200: OpenApiResponse(description="Login con Google exitoso")}
    )
    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        google_id_token = serializer.validated_data["idToken"] 

        try:
            
            firebase_api_key = 'AIzaSyC3J3Cqen8SY8QXln6L8NhTRRYoSvpcx-s'
           
            url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key={firebase_api_key}"

            
            payload = {
                'postBody': f"id_token={google_id_token}&providerId=google.com",
                'requestUri': 'http://localhost',
                'returnSecureToken': True
            }

            resp = requests.post(url, json=payload)
            data = resp.json()

            if 'error' in data:
                return Response({"error": data['error']['message']}, status=400)
                
            uid = data.get("localId")
            
        
            user_ref = firestore_db.collection("usuarios").document(uid)
            if not user_ref.get().exists:
    
                user_ref.set({
                    "email": data.get("email"), 
                    "name": data.get("displayName", ""),
                    "saldo": 0
                })
         
            user_data = user_ref.get().to_dict()

          
            return Response({
                "uid": uid,
                "idToken": data.get("idToken"),
                "refreshToken": data.get("refreshToken"),
                "profile": user_data
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
