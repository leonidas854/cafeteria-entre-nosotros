from django.db import models
from django.contrib.auth.models import AbstractUser
from Admin.models import Producto, UsuarioBase
from django.contrib.auth.models import AbstractUser, Group, Permission

# Create your models here.

class Cliente(models.Model):
    user = models.OneToOneField(
        UsuarioBase,
        on_delete=models.CASCADE,
        related_name='cliente'
    )
    ubicacion = models.CharField(max_length=100)
    apell_materno = models.CharField(max_length=100,default=' ')
    telefono = models.IntegerField(default=0)
    nit =  models.IntegerField(default=0)
    latitud = models.FloatField()
    longitud = models.FloatField()
    
class Pedido(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE,related_name="pedidos")
    total = models.FloatField()
    total_descuento =  models.FloatField()
    tipo_entrega = models.CharField(max_length=100)
    estado_pedido = models.CharField(max_length=100)
class Detalle_pedido(models.Model):
    cantidad = models.IntegerField()
    precio_unitario = models.FloatField()
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE,related_name="detalle_pedidos")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE,related_name="detalle_productos")

class Extra(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.FloatField()
    detalle_pedido = models.ManyToManyField(Detalle_pedido,related_name="extras")
    
    