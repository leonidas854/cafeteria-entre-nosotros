using Cafeteria_back.Entities.Carritos;
using Cafeteria_back.Entities.Extras;
using Cafeteria_back.Entities.Pedidos;
using Cafeteria_back.Entities.Promociones;
using Cafeteria_back.Entities.Tablas_intermedias;
using Cafeteria_back.Repositories.Implementations;
using Cafeteria_back.Repositories.Interfaces;
using Cafeteria_back.Repositorio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Cafeteria_back.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : Controller
    {
        private readonly ICarritoService _carritoService;
        private readonly MiDbContext _miDbContext;
        private readonly DescuentoStrategyContext _descuentoContext;

        public HomeController(ICarritoService carritoService, MiDbContext context, DescuentoStrategyContext descuentoContext)
        {
            _carritoService = carritoService;
            _miDbContext = context;
            _descuentoContext = descuentoContext;
        }

        [HttpPost("agregar_varios")]
        public async Task<IActionResult> Agregar2(int repeticiones)
        {
            var random = new Random();
            for (int rep = 1; rep <= repeticiones; rep++)
            {
                var carritoTemporal = new Carrito
                {
                    ClienteId = random.Next(1, 520),
                    EmpleadoId = random.Next(1, 4),
                    Items = new List<ItemCarrito>()
                };

                long productos_maximo = random.Next(1, 30);
                for (int i = 1; i < productos_maximo; i++)
                {
                    long productoIdAleatorio = random.Next(12, 63);
                    int cantidadAleatoria = random.Next(1, 5);

                    var itemExistente = carritoTemporal.Items.FirstOrDefault(p => p.ProductoId == productoIdAleatorio);

                    if (itemExistente != null)
                    {
                        itemExistente.Cantidad += cantidadAleatoria;
                    }
                    else
                    {
                        var nuevoItem = new ItemCarrito
                        {
                            ProductoId = productoIdAleatorio,
                            Cantidad = cantidadAleatoria,
                            Extras = new List<ExtraCarrito> { new ExtraCarrito { ExtraId = random.Next(1, 2) } }
                        };
                        carritoTemporal.Items.Add(nuevoItem);
                    }
                }


                await ActualizarEstadoPromocionesCarrito(carritoTemporal);
                var carritoCreado = await _carritoService.Crear_(carritoTemporal);
                string idCarritoParaPedido = carritoCreado.Id!;

                try
                {
                    await ConfirmarPedido(idCarritoParaPedido, "Mesa", "QR");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al procesar la repetición {rep}: {ex.Message}");
                }
            }

            return Ok($"{repeticiones} pedidos han sido procesados.");
        }

        [NonAction]
        public async Task<IActionResult> ConfirmarPedido(
                                                        string carritoId,
                                                        string tipoEntrega ,
                                                        string Tipo_pago)
        {
            using var transaction = await _miDbContext.Database.BeginTransactionAsync();
            try
            {
                tipoEntrega = "Mesa";
                Tipo_pago = "QR";
                var carrito = await _carritoService.ObtenerPorId(carritoId);
                if (carrito == null)
                    return NotFound("Carrito no encontrado.");

                if (carrito.Items == null || carrito.Items.Count==0)
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

                _miDbContext.Pedidos.Add(pedido);
                await _miDbContext.SaveChangesAsync();

                float totalEstimado = 0;
                float totalDescuento = 0;

                var promoAplicable = await ObtenerPromocionAplicableAlCarrito(carrito);

                foreach (var item in carrito.Items)
                {

                    var productoExiste = await _miDbContext.Productos.AnyAsync(p => p.Id_producto == item.ProductoId);
                    var productoDb = await _miDbContext.Productos.FindAsync(item.ProductoId);
                    if (!productoExiste)
                        return BadRequest($"El producto con ID {item.ProductoId} no existe.");

                    IProducto baseProd = new ProductoBase(productoDb!.Nombre!, productoDb.Precio, "café");

                    foreach (var extra in item.Extras)
                    {

                        var extraExiste = await _miDbContext.Extras.AnyAsync(e => e.Id_extra == extra.ExtraId);
                        var extraDb = await _miDbContext.Extras.FindAsync(extra.ExtraId);
                        if (!extraExiste)
                            return BadRequest($"El extra con ID {extra.ExtraId} no existe.");

                        var extraObj = new Extra { Precio = extraDb!.Precio, Name = extra.Nombre };
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
                    _miDbContext.DetallesPedido.Add(detalle);
                    await _miDbContext.SaveChangesAsync();

                    foreach (var extra in item.Extras)
                    {
                        var detalleExtra = new Detalle_extra
                        {
                            Detalle_pedido_id = detalle.Id_detalle_pedido,
                            Extra_id = extra.ExtraId
                        };
                        _miDbContext.DetalleExtra.Add(detalleExtra);
                    }
                }

                pedido.Total_estimado = totalEstimado;
                pedido.Total_descuento = totalDescuento;
                await _miDbContext.SaveChangesAsync();
                


                var venta = new Venta
                {
                    Empleado_id = carrito.EmpleadoId,
                    Pedido_id = pedido.Id_pedido,
                    Total_final = totalEstimado - totalDescuento,
                    Ven_fecha = RandomUtcDateTime(),
                    Tipo_de_Pago = Tipo_pago
                };

                _miDbContext.Ventas.Add(venta);
                await _miDbContext.SaveChangesAsync();

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

        static Random rnd = new Random();
        [NonAction]
        public static DateTime RandomUtcDateTime()
        {
            int year = rnd.Next(2006, 2031);              // Años entre 2000 y 2030
            int month = rnd.Next(1, 13);                  // Meses 1 - 12
            int day = rnd.Next(1, DateTime.DaysInMonth(year, month) + 1); // Días válidos
            int hour = rnd.Next(0, 24);                   // Horas 0 - 23
            int minute = rnd.Next(0, 60);                 // Minutos 0 - 59
            int second = rnd.Next(0, 60);                 // Segundos 0 - 59

            return new DateTime(year, month, day, hour, minute, second, DateTimeKind.Utc);
        }


        [NonAction]
        private async Task<Promocion?> ObtenerPromocionAplicableAlCarrito(Carrito carrito)
        {
            var promociones = await _miDbContext.Promociones
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
        private async Task ActualizarEstadoPromocionesCarrito(Carrito carrito)
        {

            var promocionesVigentes = await _miDbContext.ProductopPromocion
                .Include(pp => pp.Promocion)
                .Where(pp =>
                    pp.Promocion!.Fech_ini <= DateTime.UtcNow &&
                    pp.Promocion.Fecha_final >= DateTime.UtcNow)
                .ToListAsync();


            var promocionesPorProducto = promocionesVigentes
                .GroupBy(pp => pp.Promocion_id)
                .ToDictionary(g => g.Key, g => g.ToList());

            foreach (var grupo in promocionesPorProducto)
            {
                var promocionId = grupo.Key;
                var productosRequeridos = grupo.Value.Select(pp => pp.Producto_id).ToHashSet();


                bool seCumplePromocion = productosRequeridos.All(promoProdId =>
                            carrito.Items.Any(item => item.ProductoId == promoProdId && item.Cantidad == 1));


                foreach (var item in carrito.Items)
                {
                    if (productosRequeridos.Contains(item.ProductoId))
                    {
                        if (seCumplePromocion)
                        {
                            var promocion = grupo.Value.Select(pp => pp.Promocion).FirstOrDefault(p => p != null);
                            if (promocion == null) continue;

                            item.TienePromocion = true;
                            item.PrecioPromocional = item.PrecioUnitario * (1 - (promocion.Descuento / 100f));
                            item.DescripcionPromocion = promocion.Strategykey;
                        }
                        else
                        {
                            item.TienePromocion = false;
                            item.PrecioPromocional = null;
                            item.DescripcionPromocion = null;
                        }
                    }
                }
            }
        }

    }
}
