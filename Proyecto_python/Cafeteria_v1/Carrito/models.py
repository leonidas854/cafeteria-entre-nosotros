from django.db import models
from django.conf import settings 
from django.db.models import CheckConstraint, Q
# Create your models here.


class Carrito(models.Model):
    

    cliente = models.ForeignKey(
        'Admin.Cliente', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='carritos'
    )
 
    empleado = models.ForeignKey(
        'Caja.Empleado', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='carritos_atendidos')

class ItemCarrito(models.Model):
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey('Admin.Producto', on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    

    extras = models.ManyToManyField('Cliente.Extra', blank=True)


    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre}"


