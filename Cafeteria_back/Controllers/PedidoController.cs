using Cafeteria_back.Entities.Carritos;
using Cafeteria_back.Entities.Extras;
using Cafeteria_back.Entities.Pedidos;
using Cafeteria_back.Entities.Promociones;
using Cafeteria_back.Entities.Tablas_intermedias;
using Cafeteria_back.Repositories.Implementations;
using Cafeteria_back.Repositories.Interfaces;
using Cafeteria_back.Repositorio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria_back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PedidoController : Controller
    {
        private readonly CarritoService _carritoService;
        private readonly MiDbContext _context;
        private readonly DescuentoStrategyContext _descuentoContext;

        public PedidoController(CarritoService carritoService, MiDbContext context, DescuentoStrategyContext descuentoContext)
        {
            _carritoService = carritoService;
            _context = context;
            _descuentoContext = descuentoContext;
        }
        private long ObtenerClienteIdDesdeToken()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim == null || !long.TryParse(claim.Value, out var clienteId))
                throw new UnauthorizedAccessException("No se pudo obtener el ID del cliente desde el token.");
            return clienteId;
        }

        [HttpPost("confirmar")]
        public async Task<IActionResult> ConfirmarPedido([FromQuery] string carritoId, [FromQuery] string tipoEntrega)
        {
            long clienteId;
            try
            {
                clienteId = ObtenerClienteIdDesdeToken();
            }
            catch
            {
                return Unauthorized("Token inválido o faltan claims.");
            }
            var carrito = await _carritoService.ObtenerPorId(carritoId);
            if (carrito == null) return NotFound("Carrito no encontrado");

            var pedido = new Pedido
            {
                Cliente_id = clienteId,
                Tipo_Entrega = Enum.Parse<Tipo_entrega>(tipoEntrega),
                estado = Estado_pedido.En_espera,
                Total_estimado = 0,
                Total_descuento = 0,
                Detalle_pedido = new List<Detalle_pedido>()
            };

            _context.Pedidos.Add(pedido);
            await _context.SaveChangesAsync();

            float totalEstimado = 0;
            float totalDescuento = 0;

            foreach (var item in carrito.Items)
            {
                IProducto baseProd = new ProductoBase(item.Nombre, item.PrecioUnitario, "café");
                foreach (var extra in item.Extras)
                {
                    var extraObj = new Extra { Precio = extra.Precio, Name = extra.Nombre };
                    baseProd = new ExtraDecoradorGenerico(baseProd, extraObj);
                }

                float precioFinal = baseProd.Precio();
                var promo = await ObtenerPromocionVigentePorProducto(item.ProductoId);

                float descuento = 0;
                if (promo != null)
                {
                    descuento = _descuentoContext.AplicarDescuento(
                        promo.Strategykey!, precioFinal, promo.Descuento, item.Cantidad);
                }

                float precioConDescuento = precioFinal - descuento;

                var detalle = new Detalle_pedido
                {
                    Producto_id = item.ProductoId,
                    Cantidad = item.Cantidad,
                    Precio_unitario = item.PrecioUnitario
                };

                totalEstimado += precioFinal * item.Cantidad;
                totalDescuento += descuento * item.Cantidad;

                pedido.Detalle_pedido.Add(detalle);
                await _context.SaveChangesAsync();

                foreach (var extra in item.Extras)
                {
                    var detalleExtra = new Detalle_extra
                    {
                        Detalle_pedido_id = detalle.Id_detalle_pedido,
                        Extra_id = extra.ExtraId
                    };
                    _context.DetalleExtra.Add(detalleExtra);
                }
            }

            pedido.Total_estimado = totalEstimado;
            pedido.Total_descuento = totalDescuento;

            await _context.SaveChangesAsync();
            await _carritoService.Eliminar(carrito.Id);

            return Ok(new
            {
                pedido_id = pedido.Id_pedido,
                total_estimado = pedido.Total_estimado,
                total_descuento = pedido.Total_descuento
            });
        }

        private async Task<Promocion?> ObtenerPromocionVigentePorProducto(long productoId)
        {
            return await _context.ProductopPromocion
                .Where(pp => pp.Producto_id == productoId &&
                             pp.Promocion!.Fech_ini <= DateTime.UtcNow &&
                             pp.Promocion.Fecha_final >= DateTime.UtcNow)
                .Select(pp => pp.Promocion)
                .FirstOrDefaultAsync();
        }
    }
}