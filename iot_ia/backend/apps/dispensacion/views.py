from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase.firebase_init import firestore_db, get_user_doc

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from django.conf import settings
from rest_framework.permissions import AllowAny
import requests

from .serializers import ProductoRecomendadoSerializer
import random

class IniciarDispensacionView(APIView):
    def post(self, request):
        uid = request.data.get('uid')
        bebida = request.data.get('bebida')
        volumen = request.data.get('volumen')
        if not all([uid, bebida, volumen]):
            return Response({'error': 'campos faltantes'}, status=status.HTTP_400_BAD_REQUEST)
# validar saldo en Firebase
        user_ref = get_user_doc(uid)
        user = user_ref.get()
        if not user.exists:
            return Response({'error': 'usuario no existe'}, status=status.HTTP_404_NOT_FOUND)
        saldo = user.to_dict().get('saldo', 0)
# precio simple: precio = volumen * precio_unitario (ej 0.02)
        precio_unitario = 0.02
        price = float(volumen) * precio_unitario
        if float(saldo) < price:
            return Response({'error': 'saldo insuficiente'}, status=status.HTTP_402_PAYMENT_REQUIRED)
# crear registro de dispensación en Firebase y pedir a Node-RED que actúe
        dispens_ref = firestore_db.collection('dispensaciones').document()
        dispens_data = {
            'uid': uid,
            'bebida': bebida,
            'volumen_solicitado': volumen,
            'precio_estimado': price,
            'status': 'pendiente',
        }
        dispens_ref.set(dispens_data)
# opción 1: escribir en colección /commands que Node-RED monitorea
        firestore_db.collection('commands').document(dispens_ref.id).set({
            'action': 'dispensar',
            'dispensacion_id': dispens_ref.id,
            **dispens_data,
        })
        return Response({'ok': True, 'dispensacion_id': dispens_ref.id})






class RecomendacionesProxyView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        description="Obtiene recomendaciones de una API externa, selecciona dos al azar, completa las URLs de imagen y las devuelve.",
        responses={200: ProductoRecomendadoSerializer(many=True)}
    )
    def get(self, request):

        recomendaciones_api_url = f"{settings.RECOMENDACIONES}/recomendaciones"
        image_base_url = settings.IMAGE_SERVER_BASE_URL

        try:
           
            print(f"Llamando a la API de recomendaciones externa en: {recomendaciones_api_url}")
            response = requests.get(recomendaciones_api_url)
            response.raise_for_status() 
            
            data = response.json()
            
            todos_los_productos = data.get('productos', [])

            if not isinstance(todos_los_productos, list) or not todos_los_productos:
                raise Exception("La API externa no devolvió una lista de productos válida.")

           
            try:
                productos_al_azar = random.sample(todos_los_productos, 2)
            except ValueError:
            
                productos_al_azar = todos_los_productos
            for producto in productos_al_azar:
                if isinstance(producto, dict) and 'imagen' in producto:
                    relative_path = producto['imagen']
                    producto['imagen'] = f"{image_base_url}{relative_path}"
            
            serializer = ProductoRecomendadoSerializer(productos_al_azar, many=True)
            
            return Response(serializer.data, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            print(f"❌ Error al conectar con la API de recomendaciones externa: {e}")
            return Response(
                {"error": "No se pudo obtener la lista de recomendaciones."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        except Exception as e:
            print(f"❌ Error inesperado al procesar las recomendaciones: {e}")
            return Response(
                {"error": "Ocurrió un error inesperado al generar las recomendaciones."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

class ProductoDetailView(APIView):

    permission_classes = [AllowAny]

    @extend_schema(
        description="Obtiene los detalles de un producto específico por su ID.",
        responses={
            200: ProductoRecomendadoSerializer(),
            404: OpenApiResponse(description="Producto no encontrado."),
        }
    )
    def get(self, request, producto_id): 
        productos_api_url = settings.RECOMENDACIONES
        image_base_url = settings.IMAGE_SERVER_BASE_URL

        try:
            
            print(f"Llamando a la API de productos en: {productos_api_url}")
            response = requests.get(productos_api_url)
            response.raise_for_status()
            data = response.json()
            todos_los_productos =data.get('productos', [])

            producto_encontrado = None
            for producto in todos_los_productos:
                
                if str(producto.get('id_producto')) == str(producto_id):
                    producto_encontrado = producto
                    break 

            if producto_encontrado is None:
                print(f"❌ Producto con ID {producto_id} no fue encontrado en la API externa.")
                return Response(
                    {"error": f"Producto con ID {producto_id} no encontrado."},
                    status=status.HTTP_404_NOT_FOUND
                )

        
            relative_path = producto_encontrado.get('imagen', '')
            producto_encontrado['imagen'] = f"{image_base_url}{relative_path}"
            
          
            serializer = ProductoRecomendadoSerializer(producto_encontrado)
            
            return Response(serializer.data, status=status.HTTP_200_OK)

        except requests.exceptions.RequestException as e:
            print(f"❌ Error al conectar con la API de productos: {e}")
            return Response({"error": "No se pudo obtener la lista de productos."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            print(f"❌ Error inesperado al procesar el detalle del producto: {e}")
            return Response({"error": "Ocurrió un error inesperado."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)