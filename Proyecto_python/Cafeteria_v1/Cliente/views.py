from django.shortcuts import render
from django.contrib.auth import authenticate,login,logout,get_user_model
# Create your views here.

from rest_framework import viewsets,status

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.response import Response


from .models import  Detalle_pedido, Extra
from .serializers import ClienteSerializer,ExtraSerializer
from Caja.models import Empleado
from Admin.models import Cliente

#@permission_classes([AllowAny])
class ClienteViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer

class ExtraViewSet(viewsets.ModelViewSet):

    queryset = Extra.objects.all()
    serializer_class = ExtraSerializer
    permission_classes = [IsAuthenticated]
    
    lookup_field = 'name' 
    lookup_url_kwarg = 'name' 


    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)


    def create(self, request, *args, **kwargs):

        response = super().create(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            return Response({"isSuccess": True}, status=status.HTTP_200_OK)
        return response


    def retrieve(self, request, *args, **kwargs):

        instance = Extra.objects.filter(name__iexact=kwargs[self.lookup_url_kwarg]).first()
        if not instance:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):

        kwargs['partial'] = False 
        instance = Extra.objects.filter(name__iexact=kwargs[self.lookup_url_kwarg]).first()
        if not instance:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(status=status.HTTP_204_NO_CONTENT)

    def destroy(self, request, *args, **kwargs):

        instance = Extra.objects.filter(name__iexact=kwargs[self.lookup_url_kwarg]).first()
        if not instance:
            return Response(status=status.HTTP_404_NOT_FOUND)
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    


