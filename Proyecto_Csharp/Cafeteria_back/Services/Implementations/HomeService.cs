using Cafeteria_back.Entities.Carritos;
using Cafeteria_back.Entities.Extras;
using Cafeteria_back.Entities.Pedidos;
using Cafeteria_back.Entities.Promociones;
using Cafeteria_back.Entities.Tablas_intermedias;
using Cafeteria_back.Repositories.Implementations;
using Cafeteria_back.Repositories.Interfaces;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria_back.Services.Implementations
{
    public class HomeService : IHomeService
    {
        private readonly MiDbContext _context;
        private readonly ICarritoService _carritoService;
        private readonly DescuentoStrategyContext _descuentoContext;
        private static readonly Random rnd = new Random();

        public HomeService(MiDbContext context, ICarritoService carritoService, DescuentoStrategyContext descuentoContext)
        {
            _context = context;
            _carritoService = carritoService;
            _descuentoContext = descuentoContext;
        }

        public async Task<string> AgregarVariosAsync(int repeticiones)
        {
            for (int rep = 1; rep <= repeticiones; rep++)
            {
                var carritoTemporal = new Carrito
                {
                    ClienteId = rnd.Next(1, 520),
                    EmpleadoId = rnd.Next(1, 4),
                    Items = new List<ItemCarrito>()
                };

                long productos_maximo = rnd.Next(1, 30);
                for (int i = 1; i < productos_maximo; i++)
                {
                    long productoIdAleatorio = rnd.Next(12, 63);
                    int cantidadAleatoria = rnd.Next(1, 5);

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
                            Extras = new List<ExtraCarrito> { new ExtraCarrito { ExtraId = rnd.Next(1, 2) } }
                        };
                        carritoTemporal.Items.Add(nuevoItem);
                    }
                }

                await ActualizarEstadoPromocionesCarrito(carritoTemporal);
                var carritoCreado = await _carritoService.Crear_(carritoTemporal);
                string idCarritoParaPedido = carritoCreado.Id!;

                try
                {
                    await ConfirmarPedidoMock(idCarritoParaPedido, "Mesa", "QR");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error al procesar la repetición {rep}: {ex.Message}");
                }
            }

            return $"{repeticiones} pedidos han sido procesados.";
        }

        private async Task ConfirmarPedidoMock(string carritoId, string tipoEntrega, string tipoPago)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var carrito = await _carritoService.ObtenerPorId(carritoId);
                if (carrito == null || carrito.Items == null || !carrito.Items.Any())
                    throw new Exception("Carrito inválido");

                if (!Enum.TryParse<Tipo_entrega>(tipoEntrega, out var tipoEntregaParsed))
                    throw new Exception("Tipo de entrega inválido");

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
                    var productoDb = await _context.Productos.FindAsync(item.ProductoId);
                    if (productoDb == null) throw new Exception("Producto no existe");

                    IProducto baseProd = new ProductoBase(productoDb.Nombre!, productoDb.Precio, "café");

                    foreach (var extra in item.Extras)
                    {
                        var extraDb = await _context.Extras.FindAsync(extra.ExtraId);
                        if (extraDb == null) throw new Exception("Extra no existe");

                        var extraObj = new Extra { Precio = extraDb.Precio, Name = extraDb.Name };
                        baseProd = new ExtraDecoradorGenerico(baseProd, extraObj);
                    }

                    float precioFinal = baseProd.Precio();
                    float descuento = 0;

                    if (promoAplicable != null && promoAplicable.Producto_promocion!.Any(pp => pp.Producto_id == item.ProductoId))
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
                await _context.SaveChangesAsync();

                var venta = new Venta
                {
                    Empleado_id = carrito.EmpleadoId,
                    Pedido_id = pedido.Id_pedido,
                    Total_final = totalEstimado - totalDescuento,
                    Ven_fecha = RandomUtcDateTime(),
                    Tipo_de_Pago = tipoPago
                };

                _context.Ventas.Add(venta);
                await _context.SaveChangesAsync();
                await _carritoService.Eliminar(carrito.Id!);
                await transaction.CommitAsync();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private static DateTime RandomUtcDateTime()
        {
            int year = rnd.Next(2006, 2031);
            int month = rnd.Next(1, 13);
            int day = rnd.Next(1, DateTime.DaysInMonth(year, month) + 1);
            int hour = rnd.Next(0, 24);
            int minute = rnd.Next(0, 60);
            int second = rnd.Next(0, 60);

            return new DateTime(year, month, day, hour, minute, second, DateTimeKind.Utc);
        }

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
                    carrito.Items.Any(item => item.ProductoId == productoId && item.Cantidad >= 1));

                if (todosPresentes) return promo;
            }

            return null;
        }

        private async Task ActualizarEstadoPromocionesCarrito(Carrito carrito)
        {
            var promocionesVigentes = await _context.ProductopPromocion
                .Include(pp => pp.Promocion)
                .Where(pp => pp.Promocion!.Fech_ini <= DateTime.UtcNow && pp.Promocion.Fecha_final >= DateTime.UtcNow)
                .ToListAsync();

            var promocionesPorProducto = promocionesVigentes
                .GroupBy(pp => pp.Promocion_id)
                .ToDictionary(g => g.Key, g => g.ToList());

            foreach (var grupo in promocionesPorProducto)
            {
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
