from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AbstractUser, Group, Permission

# Create your models here.
class Detalle_pedido(models.Model):
    cantidad = models.IntegerField()
    precio_unitario = models.FloatField()
    pedido = models.ForeignKey('Admin.Pedido', on_delete=models.CASCADE, related_name="detalle_pedido", null=True, blank=True) 
    producto = models.ForeignKey('Admin.Producto', on_delete=models.CASCADE, related_name="detalle_productos")
    
    extras = models.ManyToManyField('Extra', related_name="detalles_de_pedido")
    

class Extra(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.FloatField()

    
    