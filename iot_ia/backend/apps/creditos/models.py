from django.db import models

class Recarga(models.Model):
    uid = models.CharField(max_length=128) 
    cantidad = models.DecimalField(max_digits=8, decimal_places=2)
    confirmado = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)


def __str__(self):
    return f"Recarga de {self.uid} +{self.amount}"
