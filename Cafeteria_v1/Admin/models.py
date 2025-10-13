from django.db import models
#from Cliente.models import Detalle_pedido
# Create your models here.

class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    precio = models.FloatField()
    tipo = models.CharField(max_length=100)
    estado = models.BooleanField()
    categoria = models.CharField(max_length=100)
    subcategoria =models.CharField(max_length=100)
    descripcion = models.CharField(max_length=100)
    sabores = models.CharField(max_length=100)
    imagen_url =  models.CharField(max_length=100)
    
class Bebida(models.Model):
    producto = models.OneToOneField(Producto, on_delete=models.CASCADE, primary_key=True)
    proporcion = models.CharField(max_length=100)
class Pedido(models.Model):
    producto = models.OneToOneField(Producto, on_delete=models.CASCADE, primary_key=True)
    tamaño = models.CharField(max_length=50)
    
class Promocion(models.Model):  
    descuento = models.FloatField()
    fecha_ini =  models.DateField()
    fech_final = models.DateField()
    descripcion = models.CharField(max_length=100)
    producto  = models.ManyToManyField(Producto,related_name="promociones")


    