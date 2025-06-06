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
        private readonly ICarritoService _carritoService;
        private readonly MiDbContext _context;
        private readonly DescuentoStrategyContext _descuentoContext;

        public PedidoController(ICarritoService carritoService, MiDbContext context, DescuentoStrategyContext descuentoContext)
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
        [HttpGet("mis-pedidos")]
        public async Task<IActionResult> ObtenerMisPedidos()
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

            var pedidos = await _context.Pedidos
                .Where(p => p.Cliente_id == clienteId)
                .Include(p => p.Detalle_pedido)!
                    .ThenInclude(dp => dp.Producto)
                .Include(p => p.Detalle_pedido)!
                    .ThenInclude(dp => dp.Detalle_extras)!
                        .ThenInclude(de => de.Extra)
                .ToListAsync();

            if (pedidos == null || !pedidos.Any())
                return NotFound("No se encontraron pedidos para este cliente.");

            var resultado = pedidos.Select(p => new
            {
                p.Id_pedido,
                p.Total_estimado,
                p.Total_descuento,
                TipoEntrega = p.Tipo_Entrega.ToString(),
                Estado = p.estado.ToString(),
                Detalles = p.Detalle_pedido!.Select(dp => new
                {
                    dp.Producto_id,
                    ProductoNombre = dp.Producto?.Nombre,
                    dp.Cantidad,
                    dp.Precio_unitario,
                    Extras = dp.Detalle_extras!.Select(de => new
                    {
                        de.Extra_id,
                        ExtraNombre = de.Extra?.Name,
                        de.Extra?.Precio
                    })
                })
            });

            return Ok(resultado);
        }


        [HttpPost("confirmar")]
        public async Task<IActionResult> ConfirmarPedido(
     [FromQuery] string carritoId,
     [FromQuery] string tipoEntrega,
     [FromQuery] string Tipo_pago)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var carrito = await _carritoService.ObtenerPorId(carritoId);
                if (carrito == null)
                    return NotFound("Carrito no encontrado.");

                if (carrito.Items == null || !carrito.Items.Any())
                    return BadRequest("El carrito no tiene productos.");

               
                if (!Enum.TryParse<Tipo_entrega>(tipoEntrega, out var tipoEntregaParsed))
                    return BadRequest("Tipo de entrega inválido.");

               

                var pedido = new Pedido
                {
                    Cliente_id = carrito.ClienteId,
                    Tipo_Entrega = tipoEntregaParsed,
                    estado = Estado_pedido.En_espera,
                    Total_estimado = 0,
                    Total_descuento = 0,
                    Detalle_pedido = new List<Detalle_pedido>()
                };

                _context.Pedidos.Add(pedido);
                await _context.SaveChangesAsync(); 

                float totalEstimado = 0;
                float totalDescuento = 0;

                var promoAplicable = await ObtenerPromocionAplicableAlCarrito(carrito);

                foreach (var item in carrito.Items)
                {
                  
                    var productoExiste = await _context.Productos.AnyAsync(p => p.Id_producto == item.ProductoId);
                    if (!productoExiste)
                        return BadRequest($"El producto con ID {item.ProductoId} no existe.");

                    IProducto baseProd = new ProductoBase(item.Nombre!, item.PrecioUnitario, "café");

                    foreach (var extra in item.Extras)
                    {
                       
                        var extraExiste = await _context.Extras.AnyAsync(e => e.Id_extra == extra.ExtraId);
                        if (!extraExiste)
                            return BadRequest($"El extra con ID {extra.ExtraId} no existe.");

                        var extraObj = new Extra { Precio = extra.Precio, Name = extra.Nombre };
                        baseProd = new ExtraDecoradorGenerico(baseProd, extraObj);
                    }

                    float precioFinal = baseProd.Precio();
                    float descuento = 0;

                    if (promoAplicable != null &&
                        promoAplicable.Producto_promocion!.Any(pp => pp.Producto_id == item.ProductoId))
                    {
                        descuento = _descuentoContext.AplicarDescuento("porcentaje", precioFinal, promoAplicable.Descuento);
                    }

                    float precioConDescuento = precioFinal - descuento;

                    var detalle = new Detalle_pedido
                    {
                        Producto_id = item.ProductoId,
                        Cantidad = item.Cantidad,
                        Precio_unitario = precioConDescuento
                    };

                    totalEstimado += precioFinal * item.Cantidad;
                    totalDescuento += descuento * item.Cantidad;

                    pedido.Detalle_pedido.Add(detalle);
                    _context.DetallesPedido.Add(detalle);
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
                await _context.SaveChangesAsync(); // Guardar totales y extras

                var venta = new Venta
                {
                    Empleado_id = carrito.EmpleadoId,
                    Pedido_id = pedido.Id_pedido,
                    Total_final = totalEstimado - totalDescuento,
                    Ven_fecha = DateTime.UtcNow,
                    Tipo_de_Pago = Tipo_pago // ← Si es enum, cambia a tipoPagoParsed
                };

                _context.Ventas.Add(venta);
                await _context.SaveChangesAsync();

                await _carritoService.Eliminar(carrito.Id!);
                await transaction.CommitAsync();

                return Ok(new
                {
                    pedido_id = pedido.Id_pedido,
                    total_estimado = pedido.Total_estimado,
                    total_descuento = pedido.Total_descuento
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine(ex.ToString());
                return StatusCode(500, $"Error al confirmar pedido: {ex.Message}");
            }
        }




        [NonAction]
        private async Task<Promocion?> ObtenerPromocionAplicableAlCarrito(Carrito carrito)
        {
            var promociones = await _context.Promociones
                .Include(p => p.Producto_promocion)
                .Where(p => p.Fech_ini <= DateTime.UtcNow && p.Fecha_final >= DateTime.UtcNow)
                .ToListAsync();

            foreach (var promo in promociones)
            {
                var productosRequeridos = promo.Producto_promocion!.Select(pp => pp.Producto_id).ToList();


                bool todosPresentes = productosRequeridos.All(productoId =>
                            carrito.Items.Any(item => item.ProductoId == productoId && item.Cantidad >= 1)
                        );


                if (todosPresentes)
                {
                    return promo;
                }
            }

            return null;
        }

    }
}