from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AbstractUser, Group, Permission
from Cliente.models import Pedido
# Create your models here.

class Empleado(AbstractUser):
    fecha_contratacion = models.DateField()
    rol = models.CharField(max_length=100)
    telefono = models.IntegerField()
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="empleado_set", 
        related_query_name="empleado",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="empleado_permissions_set", 
        related_query_name="empleado",
    )
    
class Venta(models.Model):
    fecha = models.DateField()
    total = models.IntegerField()
    estado = models.CharField(max_length=100)
    tipo_de_pago = models.CharField(max_length=100)
    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE,related_name="ventas")
    pedido = models.OneToOneField(Pedido, on_delete=models.CASCADE)
    
