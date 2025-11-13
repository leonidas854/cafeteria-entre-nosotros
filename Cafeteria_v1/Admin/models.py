from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

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
    

class UsuarioBase(AbstractUser):
    TIPO_USUARIO = (
        ('cliente', 'Cliente'),
        ('empleado', 'Empleado'),
    )
    tipo = models.CharField(max_length=20, choices=TIPO_USUARIO, default='cliente')

   
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        related_name='usuario_groups',
        related_query_name='usuario',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        related_name='usuario_permissions',
        related_query_name='usuario',
    )

    def __str__(self):
        return f"{self.username} ({self.tipo})"

    