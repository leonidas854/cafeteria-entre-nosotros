from django.db import models
from django.contrib.auth.models import AbstractUser
#from Admin.models import Producto, UsuarioBase,Pedido
from django.contrib.auth.models import AbstractUser, Group, Permission

# Create your models here.

class Cliente(models.Model):
    user = models.OneToOneField(
        'Admin.UsuarioBase',
        on_delete=models.CASCADE,
        related_name='cliente'
    )
    ubicacion = models.CharField(max_length=100)
    apell_materno = models.CharField(max_length=100,default=' ')
    telefono = models.IntegerField(default=0)
    nit =  models.IntegerField(default=0)
    latitud = models.FloatField()
    longitud = models.FloatField()
    

class Detalle_pedido(models.Model):
    cantidad = models.IntegerField()
    precio_unitario = models.FloatField()
    pedido = models.ForeignKey( 'Admin.Pedido', on_delete=models.CASCADE,related_name="detalle_pedidos")

    producto = models.ForeignKey('Admin.Producto', on_delete=models.CASCADE,related_name="detalle_productos")
    

class Extra(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.FloatField()
    detalle_pedido = models.ManyToManyField('Cliente.Detalle_pedido',related_name="extras")
    
    