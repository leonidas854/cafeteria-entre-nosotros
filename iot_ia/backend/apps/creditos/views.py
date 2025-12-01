from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import RecargaSerializer
from .models import Recarga
from firebase.firebase_init import db, get_user_doc


class SaldoView(APIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name="uid",
                description="ID del usuario",
                required=True,
                type=str
            )
        ],
        responses={200: dict}
    )
    
    def get(self, request):
# esperaremos que el frontend envíe el uid en headers o token
        uid = request.query_params.get('uid')
        if not uid:
            return Response({'error': 'uid requerido'}, status=status.HTTP_400_BAD_REQUEST)
        user_doc = get_user_doc(uid).get()
        if not user_doc.exists:
            return Response({'saldo': 0})
        data = user_doc.to_dict()
        return Response({'saldo': data.get('saldo', 0)}) # type: ignore
    
    

class  CrearRecargaView(APIView):
    
    @extend_schema(
        request=RecargaSerializer,
        responses={
            201: RecargaSerializer,
            400: OpenApiResponse(description='Error en los datos')
        },
        description="Crea una solicitud de recarga pendiente."
    )
    
    
    def post(self, request):
        serializer = RecargaSerializer(data=request.data)
        if serializer.is_valid():
            recarga = serializer.save()
        # Tdo: generar QR o marcar recarga pendiente en Firebase
            db.collection('recargas').document(str(recarga.id)).set(serializer.data) # type: ignore
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConfirmarRecargaView(APIView):
    
    @extend_schema(
        request=RecargaSerializer,
        responses={
            201: RecargaSerializer,
            400: OpenApiResponse(description='Error en los datos')
        },
        description="Crea una solicitud de recarga pendiente."
    )
    
    def post(self, request):
        recarga_id = request.data.get('recarga_id')
        if not recarga_id:
            return Response({'error': 'recarga_id requerido'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            recarga = Recarga.objects.get(id=recarga_id) # type: ignore
        except Recarga.DoesNotExist: # type: ignore
            return Response({'error': 'no existe'}, status=status.HTTP_404_NOT_FOUND)
        recarga.confirmado = True
        recarga.save()
        uid = recarga.uid
        user_ref = get_user_doc(uid)
        user = user_ref.get()
        current = 0
        if user.exists:
            current = user.to_dict().get('saldo', 0) # type: ignore
        new_saldo = float(current) + float(recarga.cantidad)
        user_ref.set({'saldo': new_saldo}, merge=True)
        return Response({'ok': True, 'new_saldo': new_saldo})