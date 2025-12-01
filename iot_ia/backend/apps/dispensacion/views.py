from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase.firebase_init import db, get_user_doc


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
        dispens_ref = db.collection('dispensaciones').document()
        dispens_data = {
            'uid': uid,
            'bebida': bebida,
            'volumen_solicitado': volumen,
            'precio_estimado': price,
            'status': 'pendiente',
        }
        dispens_ref.set(dispens_data)
# opción 1: escribir en colección /commands que Node-RED monitorea
        db.collection('commands').document(dispens_ref.id).set({
            'action': 'dispensar',
            'dispensacion_id': dispens_ref.id,
            **dispens_data,
        })
        return Response({'ok': True, 'dispensacion_id': dispens_ref.id})

