from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Recarga
from firebase.firebase_init import firestore_db, get_user_doc
from firebase_admin import firestore 
from rest_framework.permissions import AllowAny

import datetime

from .serializers import TransaccionSerializer,RecargaRequestSerializer

from rest_framework import serializers
class RealizarRecargaView(APIView):
    permission_classes = [permissions.AllowAny]

    @extend_schema(
        request=RecargaRequestSerializer,
        description="Realiza una recarga de saldo para un usuario específico."
    )
    def post(self, request):
        serializer = RecargaRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
  
        uid = serializer.validated_data['uid']
        monto = serializer.validated_data['monto']

        try:
            monto = float(monto)
            if monto <= 0:
                return Response({"error": "El monto debe ser positivo."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Monto inválido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
        
            user_ref = firestore_db.collection("usuarios").document(uid)

          
            transaction = firestore_db.transaction()

            @firestore.transactional
            def update_saldo_in_transaction(trans, user_doc_ref, monto_recarga):
          
                user_doc = user_doc_ref.get(transaction=trans)
                
                saldo_actual = 0
                if user_doc.exists:
                    saldo_actual = user_doc.to_dict().get('saldo', 0)
                
                nuevo_saldo = saldo_actual + monto_recarga
                
          
                trans.set(user_doc_ref, {'saldo': nuevo_saldo}, merge=True)
                return nuevo_saldo


            nuevo_saldo = update_saldo_in_transaction(transaction, user_ref, monto)
            

            firestore_db.collection('transacciones').add({
                'uid': uid,
                'tipo': 'recarga',
                'monto': monto,
                'descripcion': 'Recarga de saldo',
                'timestamp': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S')
            })

            return Response({"mensaje": "Recarga exitosa", "nuevo_saldo": nuevo_saldo}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": f"Error al procesar la recarga: {e}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)