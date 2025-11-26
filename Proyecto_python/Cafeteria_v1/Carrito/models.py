from django.db import models
from django.conf import settings 
from django.db.models import CheckConstraint, Q
# Create your models here.


class Carrito(models.Model):
    cliente = models.OneToOneField(
        'Admin.Cliente', on_delete=models.CASCADE, null=True, blank=True, related_name='carrito'
    )
    empleado = models.OneToOneField(
        'Caja.Empleado', on_delete=models.CASCADE, null=True, blank=True, related_name='carrito'
    )

    class Meta:
        constraints = [
            CheckConstraint(
                check=Q(cliente__isnull=False, empleado__isnull=True) | 
                      Q(cliente__isnull=True, empleado__isnull=False) |
                      Q(cliente__isnull=True, empleado__isnull=True), 
                name='un_solo_dueno_carrito'
            )
        ]

class ItemCarrito(models.Model):
    carrito = models.ForeignKey(Carrito, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey('Admin.Producto', on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField(default=1)
    

    extras = models.ManyToManyField('Cliente.Extra', blank=True)


    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre}"


