from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class EstadoPedido(models.TextChoices):
    PENDIENTE = 'pendiente', 'Pendiente'
    EN_PROCESO = 'en_proceso', 'En Proceso'
    COMPLETADO = 'completado', 'Completado'
    CANCELADO = 'cancelado', 'Cancelado'

class TipoEntrega(models.TextChoices):
    RECOGER = 'recoger', 'Recoger en tienda'
    DOMICILIO = 'domicilio', 'A Domicilio'

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
    

class Producto(models.Model):
    TIPO_PRODUCTO = (
        ('bebida','Bebida'),
        ('comida','Comida')
     )
    nombre = models.CharField(max_length=100)
    precio = models.FloatField()
    tipo = models.CharField(max_length=100)
    estado = models.BooleanField()
    categoria = models.CharField(max_length=100)
    subcategoria =models.CharField(max_length=100)
    imagen  = models.ImageField(upload_to='imagenes/',null=True,blank=True)
    descripcion = models.CharField(max_length=100)
    sabores = models.CharField(max_length=100)
    imagen_url =  models.CharField(max_length=100)
    
class Bebida(models.Model):
    producto = models.OneToOneField(Producto, 
                                    on_delete=models.CASCADE,
                                      primary_key=True,
                                      related_name='bebida')
    tamanio = models.CharField(default="",max_length=100)
class Comida(models.Model):
    producto = models.OneToOneField(Producto,on_delete=models.CASCADE,primary_key=True,
                                    related_name='comida')
    proporcion = models.CharField(max_length=100)

class Pedido(models.Model):

    cliente = models.ForeignKey(Cliente,
                                on_delete=models.CASCADE,
                                null=True,blank=True)
    total_estimado = models.FloatField(default=0)
    total_descuento = models.FloatField(default=0)
    tipo_entrega = models.CharField(
    max_length=20, 
    choices=TipoEntrega.choices, 
    default=TipoEntrega.RECOGER
)
    estado = models.CharField(
    max_length=20, 
    choices=EstadoPedido.choices, 
    default=EstadoPedido.PENDIENTE
)
class Promocion(models.Model):  
    descuento = models.FloatField()
    fecha_ini =  models.DateField()
    fech_final = models.DateField()
    descripcion = models.CharField(max_length=100)
    nombre = models.CharField(max_length=100,default="")
    url_imagen = models.CharField(max_length=100,default="")

    producto  = models.ManyToManyField(Producto,related_name="promociones")
    



