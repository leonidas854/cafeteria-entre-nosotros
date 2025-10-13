from django.db import models
from django.contrib.auth.models import AbstractUser
from Admin.models import Producto
from django.contrib.auth.models import AbstractUser, Group, Permission

# Create your models here.

class Cliente(AbstractUser):
    ubicacion = models.CharField(max_length=100)
    nit =  models.IntegerField()
    latitud = models.FloatField()
    longitud = models.FloatField()
    groups = models.ManyToManyField(
    Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="cliente_set",  
        related_query_name="cliente",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="cliente_permissions_set",  
        related_query_name="cliente",
    )
    
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
    
    