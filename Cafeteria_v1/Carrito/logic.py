from django.utils import timezone
from .models import Carrito,ItemCarrito
from Admin.models import Promocion,Pedido
from Caja.models import Venta
from Cliente.models import Detalle_pedido
from django.utils import timezone
from Admin.models import Promocion 


from django.db import transaction
from decimal import Decimal

def actualizar_promociones_en_items(items_del_carrito):

    ahora = timezone.now().date() 


    ids_productos_en_carrito = {item.producto_id for item in items_del_carrito}


    promociones_vigentes = Promocion.objects.prefetch_related('producto').filter(
        fecha_ini__lte=ahora,
        fech_final__gte=ahora,
        producto__id__in=ids_productos_en_carrito 
    )

    for item in items_del_carrito:
        item.tiene_promocion = False
        item.precio_promocional = None
        item.descripcion_promocion = None


    for promo in promociones_vigentes:

        productos_requeridos_ids = {p.id for p in promo.producto.all()}


        ids_en_carrito_set = {item.producto_id for item in items_del_carrito if item.cantidad == 1}


        se_cumple_promocion = productos_requeridos_ids.issubset(ids_en_carrito_set)
        

        if se_cumple_promocion:
            for item in items_del_carrito:
 
                if item.producto_id in productos_requeridos_ids:
                    descuento = float(promo.descuento) / 100.0
                    precio_original = float(item.producto.precio)
                    
                    item.tiene_promocion = True
                    item.precio_promocional = precio_original * (1.0 - descuento)
                    item.descripcion_promocion = promo.nombre 

    return items_del_carrito




class PedidoError(Exception):
    pass

@transaction.atomic 
def crear_pedido_desde_carrito(carrito_id: int, tipo_entrega: str, tipo_pago: str) -> Pedido:
    try:
        carrito = Carrito.objects.prefetch_related('items__producto', 'items__extras').get(id=carrito_id)
    except Carrito.DoesNotExist:
        raise PedidoError("Carrito no encontrado.")

    if not carrito.items.exists():
        raise PedidoError("El carrito no tiene productos.")

    pedido = Pedido.objects.create(
        cliente=carrito.cliente, 
        tipo_entrega=tipo_entrega,
        estado='En_espera', 
        total_estimado=Decimal('0.0'),
        total_descuento=Decimal('0.0')
    )

    total_estimado = Decimal('0.0')
    total_descuento = Decimal('0.0')
    
   
    items_con_promocion = actualizar_promociones_en_items(list(carrito.items.all()))
    
    detalles_a_crear = []
    extras_por_detalle = {}

    for item in items_con_promocion:
        precio_base = Decimal(str(item.producto.precio))
        
        precio_extras = sum(Decimal(str(extra.precio)) for extra in item.extras.all())
        
        precio_final_item = precio_base + precio_extras
        descuento_item = Decimal('0.0')

        if item.tiene_promocion and item.precio_promocional is not None:
            precio_con_descuento = Decimal(str(item.precio_promocional))
            descuento_item = precio_base - Decimal(str(item.precio_promocional))
            precio_unitario_final = Decimal(str(item.precio_promocional))
        else:
            precio_unitario_final = precio_base

        detalle = Detalle_pedido(
            pedido=pedido,
            producto=item.producto,
            cantidad=item.cantidad,
            precio_unitario=precio_unitario_final
        )
        detalles_a_crear.append(detalle)
        extras_por_detalle[detalle] = item.extras.all()

        total_estimado += precio_final_item * item.cantidad
        total_descuento += descuento_item * item.cantidad

    Detalle_pedido.objects.bulk_create(detalles_a_crear)
    
    pedido.total_estimado = total_estimado
    pedido.total_descuento = total_descuento
    pedido.save()

    Venta.objects.create(
        pedido=pedido,
        total_final=total_estimado - total_descuento,
        tipo_de_pago=tipo_pago
    )

    carrito.delete()
    
    return pedido