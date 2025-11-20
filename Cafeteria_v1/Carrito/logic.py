from django.utils import timezone
from .models import Carrito,ItemCarrito
from Admin.models import Promocion

from django.utils import timezone
from Admin.models import Promocion 

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