from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework import viewsets,status
# Create your views here.
from .serializers import EmpleadoSerializer,VentaSerializer
from .models import Empleado,Venta

from rest_framework.decorators import api_view, permission_classes,action

from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response
from Admin.models import Cliente



class EmpleadoViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Empleado.objects.all()
    serializer_class = EmpleadoSerializer

class VentaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VentaSerializer
    permission_classes = [IsAuthenticated] 

    def get_queryset(self):
        return Venta.objects.select_related('pedido').filter(pedido__cliente=self.request.user)

    @action(detail=False, methods=['get'], url_path='mis-ventas')
    def mis_ventas(self, request):
        cliente = request.user
        ventas = Venta.objects.select_related('pedido').filter(
            pedido__cliente__user=cliente
        ).order_by('fecha')

        if not ventas.exists():
            return Response(
                {"detail": "No se encontraron ventas para este cliente."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(ventas, many=True)

        return Response(serializer.data)