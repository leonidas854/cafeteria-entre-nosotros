from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AbstractUser, Group, Permission
from Admin.models import UsuarioBase,Pedido
# Create your models here.

class Empleado(models.Model):
    user = models.OneToOneField(
        UsuarioBase,
        on_delete=models.CASCADE,
        related_name='empleado'
    )
    fecha_contratacion = models.DateField()
    rol = models.CharField(max_length=100)
    telefono = models.IntegerField()
    
class Venta(models.Model):
    fecha = models.DateField()
    total = models.IntegerField()
    #estado = models.CharField(max_length=100)
    tipo_de_pago = models.CharField(max_length=100)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE,related_name="ventas")
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE,related_name='pedido')
    
