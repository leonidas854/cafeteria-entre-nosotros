# views.py

from .mqtt_service import mqtt_service 
from .serializers import DispensarComandoSerializer, DispensarProductoSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework import status
from firebase_admin.auth import verify_id_token
from rest_framework.response import Response  
import datetime
from firebase_admin import firestore
from firebase.firebase_init import firestore_db,rtdb_ref
from apps.dispensacion.serializers import ProductoRecomendadoSerializer
from django.conf import settings
import requests
import random

class EnviarComandoDispensadorView(APIView):
    permission_classes = [AllowAny] 

    @extend_schema(request=DispensarComandoSerializer)
    def post(self, request):
        serializer = DispensarComandoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        valvula_id = serializer.validated_data['valvula_id']
        ml = serializer.validated_data['ml']

        topic = "esp32/valvula"
        
    
        payload = {
            "valvula_id": valvula_id,
            "ml": ml
        }
        mqtt_service.publish(topic, payload)
        return Response({
            "message": "Comando enviado exitosamente al dispensador.",
            "topic": topic,
            "payload": payload
        }, status=status.HTTP_200_OK)
    


@firestore.transactional
def _ejecutar_compra_transaccional(transaction, user_ref, uid, costo_total):

    user_snapshot = user_ref.get(transaction=transaction)
    user_profile = user_snapshot.to_dict()
    saldo_actual = user_profile.get("saldo", 0)


    if saldo_actual < costo_total:
        raise Exception("Saldo insuficiente durante la transacción.")

 
    nuevo_saldo = saldo_actual - costo_total
    transaction.update(user_ref, {"saldo": nuevo_saldo})

    
    transaccion_ref = firestore_db.collection('transacciones').document()
    descripcion = "Compra de producto dispensado" 
    
    transaction.set(transaccion_ref, {
        'uid': uid,
        'tipo': 'gasto',
        'descripcion': descripcion,
        'monto': costo_total,
        'timestamp': datetime.datetime.now().isoformat()
    })
    
 
    return nuevo_saldo


class DispensarProductoView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(request=DispensarProductoSerializer)
    def post(self, request): 
        serializer = DispensarProductoSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        validated_data = serializer.validated_data
        token = validated_data['idToken']
        ml = validated_data['ml']
        valvula_id = validated_data['valvula_id']
        
        try:
            decoded_token = verify_id_token(token)
            uid = decoded_token["uid"]
            user_ref = firestore_db.collection("usuarios").document(uid)
            user_doc = user_ref.get()
            if not user_doc.exists:
                return Response({"error": "Usuario no encontrado."}, status=status.HTTP_404_NOT_FOUND)
            
            saldo_actual = user_doc.to_dict().get("saldo", 0)

        except Exception as e:
            return Response({"error": f"Token inválido o error de autenticación: {e}"}, status=status.HTTP_401_UNAUTHORIZED)

        PRECIO_POR_100_ML = 1.5
        costo_total = (ml / 100.0) * PRECIO_POR_100_ML

        if saldo_actual < costo_total:
            return Response({
                "error": "Saldo insuficiente.",
                "saldo_actual": saldo_actual,
                "costo_requerido": costo_total
            }, status=status.HTTP_402_PAYMENT_REQUIRED)

        try:
          
            transaction = firestore_db.transaction()
            
            nuevo_saldo = _ejecutar_compra_transaccional(transaction, user_ref, uid, costo_total)

       
            topic = "esp32/valvula"
            payload = {"valvula_id": valvula_id, "ml": ml}
            mqtt_service.publish(topic, payload)

            return Response({
                "message": "Compra exitosa. Dispensando producto.",
                "nuevo_saldo": nuevo_saldo,
                "costo": costo_total
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": f"Error durante la transacción: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ClimaRecomendacionesView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        description="Obtiene recomendaciones basadas en el clima, usando los últimos datos de sensores de temperatura y humedad.",
        responses={200: ProductoRecomendadoSerializer(many=True)}
    )
    def get(self, request):
        
        try:
            print("Obteniendo últimos datos de sensores desde Firebase RTDB...")

            temp_data = rtdb_ref.child('sensores/temperatura').order_by_key().limit_to_last(1).get()
            hum_data = rtdb_ref.child('sensores/humedad').order_by_key().limit_to_last(1).get()

            last_temp = list(temp_data.values())[0] if temp_data else 25  # 
            last_hum = list(hum_data.values())[0] if hum_data else 50    # 

            print(f"✅ Datos obtenidos: Temperatura={last_temp}°C, Humedad={last_hum}%")

        except Exception as e:
            print(f"❌ Error al leer desde Firebase RTDB: {e}")
            return Response(
                {"error": "No se pudieron obtener los datos de los sensores."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        recomendaciones_api_url = f"{settings.RECOMENDACIONES}/recomendaciones/clima"
        image_base_url = settings.IMAGE_SERVER_BASE_URL
        
  
        url_con_parametros = f"{recomendaciones_api_url}?temperatura={last_temp}&humedad={last_hum}"

        try:
            print(f"Llamando a la API de recomendaciones por clima en: {url_con_parametros}")
            response = requests.get(url_con_parametros)
            response.raise_for_status()  
            data = response.json()
            productos_recomendados = data.get('productos', [])

            if not isinstance(productos_recomendados, list):
                raise Exception("La API externa no devolvió una lista de productos válida.")
            
            
            try:
              
                productos_al_azar = random.sample(productos_recomendados, 2)
            except ValueError:
              
                print("Advertencia: Se recibieron menos de 2 productos, se devolverán todos.")
                productos_al_azar = productos_recomendados 
            
           
            print(f"Procesando {len(productos_al_azar)} recomendaciones seleccionadas...")
            for producto in productos_al_azar:
                if isinstance(producto, dict) and 'imagen' in producto:
                    relative_path = producto['imagen']
                    producto['imagen'] = f"{image_base_url.rstrip('/')}/{relative_path.lstrip('/')}"
            
            
            serializer = ProductoRecomendadoSerializer(productos_al_azar, many=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            print(f"❌ Error al conectar con la API de recomendaciones por clima: {e}")
            return Response(
                {"error": "No se pudo obtener la lista de recomendaciones por clima."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            print(f"❌ Error inesperado al procesar las recomendaciones por clima: {e}")
            return Response(
                {"error": "Ocurrió un error inesperado al generar las recomendaciones."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )