using Cafeteria_back.Entities.Carritos;
using Cafeteria_back.Entities.Promociones;
using Cafeteria_back.Repositorio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Cafeteria_back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CarritoController : Controller
    {
        private readonly CarritoService _carritoService;
        private readonly MiDbContext _miDbContext;

        public CarritoController(CarritoService carritoService, MiDbContext miDbContext)
        {
            _carritoService = carritoService;
            _miDbContext = miDbContext;
        }
        private long ObtenerClienteIdDesdeToken()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim == null || !long.TryParse(claim.Value, out var clienteId))
                throw new UnauthorizedAccessException("No se pudo obtener el ID del cliente desde el token.");
            return clienteId;
        }
        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            long usuarioId;
            string? rol;

            try
            {
                usuarioId = ObtenerClienteIdDesdeToken();
                rol = User.FindFirst(ClaimTypes.Role)?.Value;
            }
            catch
            {
                return Unauthorized("Token inválido o faltan claims.");
            }

            Carrito? carrito = null;

            if (rol == "Cliente")
            {
                carrito = await _carritoService.ObtenerPorCliente(usuarioId);
            }
            else if (rol == "Empleado")
            {
                carrito = await _carritoService.ObtenerPorEmpleado(usuarioId);
            }
            else
            {
                return Unauthorized("Rol no reconocido.");
            }

            if (carrito == null)
                return NotFound();

            await ActualizarEstadoPromocionesCarrito(carrito);

            return Ok(carrito);
        }


        [HttpPost("agregar")]
        public async Task<IActionResult> Agregar([FromBody] Carrito carrito)
        {
            long usuarioId;
            string? rol;

            try
            {
                usuarioId = ObtenerClienteIdDesdeToken();
                rol = User.FindFirst(ClaimTypes.Role)?.Value;
            }
            catch
            {
                return Unauthorized("Token inválido o faltan claims.");
            }

            Carrito? carritoExistente = null;

            if (rol == "Cliente")
            {
                carrito.ClienteId = carrito.ClienteId?? usuarioId;
                carritoExistente = await _carritoService.ObtenerPorCliente(usuarioId);
            }
            else if (rol == "Empleado")
            {
                carrito.EmpleadoId = usuarioId;
                carritoExistente = await _carritoService.ObtenerPorEmpleado(usuarioId);
            }
            else
            {
                return Unauthorized("Rol no reconocido.");
            }

            if (carritoExistente == null)
            {
                await ActualizarEstadoPromocionesCarrito(carrito);
                await _carritoService.Crear(carrito);
            }
            else
            {
                foreach (var item in carrito.Items)
                {
                    var existente = carritoExistente.Items.FirstOrDefault(p =>
                        p.ProductoId == item.ProductoId &&
                        p.Extras.Count == item.Extras.Count &&
                        !p.Extras.Select(e => e.ExtraId).Except(item.Extras.Select(e => e.ExtraId)).Any());

                    if (existente != null)
                    {
                        existente.Cantidad += item.Cantidad;
                    }
                    else
                    {
                        carritoExistente.Items.Add(item);
                    }
                }

                await ActualizarEstadoPromocionesCarrito(carritoExistente);
                await _carritoService.Actualizar(carritoExistente.Id!, carritoExistente);
            }

            return Ok();
        }

        [HttpPut("modificar-cantidad")]
        public async Task<IActionResult> ModificarCantidad([FromBody] ModificarCantidadDto dto)
        {
            long usuarioId;
            string? rol;

            try
            {
                usuarioId = ObtenerClienteIdDesdeToken();
                rol = User.FindFirst(ClaimTypes.Role)?.Value;
            }
            catch
            {
                return Unauthorized("Token inválido o faltan claims.");
            }

            Carrito? carrito = rol switch
            {
                "Cliente" => await _carritoService.ObtenerPorCliente(usuarioId),
                "Empleado" => await _carritoService.ObtenerPorEmpleado(usuarioId),
                _ => null
            };

            if (carrito == null) return NotFound();

            var item = carrito.Items.FirstOrDefault(i =>
                i.ProductoId == dto.ProductoId &&
                i.Extras.Count == dto.ExtraIds!.Count &&
                !i.Extras.Select(e => e.ExtraId).Except(dto.ExtraIds).Any());

            if (item == null) return NotFound("Ítem no encontrado.");

            item.Cantidad = dto.NuevaCantidad;

            await ActualizarEstadoPromocionesCarrito(carrito);
            await _carritoService.Actualizar(carrito.Id!, carrito);

            return Ok(carrito);
        }

        [HttpPut("modificar-extras")]
        public async Task<IActionResult> ModificarExtras([FromBody] ModificarExtrasDto dto)
        {
            long usuarioId;
            string? rol;

            try
            {
                usuarioId = ObtenerClienteIdDesdeToken();
                rol = User.FindFirst(ClaimTypes.Role)?.Value;
            }
            catch
            {
                return Unauthorized("Token inválido o faltan claims.");
            }

            Carrito? carrito = rol switch
            {
                "Cliente" => await _carritoService.ObtenerPorCliente(usuarioId),
                "Empleado" => await _carritoService.ObtenerPorEmpleado(usuarioId),
                _ => null
            };

            if (carrito == null) return NotFound();

            var item = carrito.Items.FirstOrDefault(i => i.ProductoId == dto.ProductoId);
            if (item == null) return NotFound("Producto no encontrado en el carrito.");

            item.Extras = dto.NuevosExtras;

            await ActualizarEstadoPromocionesCarrito(carrito);
            await _carritoService.Actualizar(carrito.Id!, carrito);

            return Ok(carrito);
        }

        [HttpDelete("quitar-producto")]
        public async Task<IActionResult> QuitarProducto([FromBody] QuitarProductoDto dto)
        {
            long usuarioId;
            string? rol;

            try
            {
                usuarioId = ObtenerClienteIdDesdeToken();
                rol = User.FindFirst(ClaimTypes.Role)?.Value;
            }
            catch
            {
                return Unauthorized("Token inválido o faltan claims.");
            }

            Carrito? carrito = rol switch
            {
                "Cliente" => await _carritoService.ObtenerPorCliente(usuarioId),
                "Empleado" => await _carritoService.ObtenerPorEmpleado(usuarioId),
                _ => null
            };

            if (carrito == null) return NotFound();

            carrito.Items.RemoveAll(i =>
                i.ProductoId == dto.ProductoId &&
                i.Extras.Select(e => e.ExtraId).OrderBy(x => x)
                    .SequenceEqual(dto.ExtraIds.OrderBy(x => x)));

            await ActualizarEstadoPromocionesCarrito(carrito);
            await _carritoService.Actualizar(carrito.Id!, carrito);

            return Ok(carrito);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(string id)
        {
            await _carritoService.Eliminar(id);
            return Ok();
        }
        [HttpPut("asignar-a-cliente/{carritoId}")]
        public async Task<IActionResult> AsignarCarritoACliente(string carritoId, [FromQuery] long clienteId)
        {
            var carrito = await _carritoService.ObtenerPorId(carritoId);

            if (carrito == null)
                return NotFound();

            carrito.ClienteId = clienteId;

            await _carritoService.Actualizar(carritoId, carrito);

            return Ok();
        }

        [NonAction]
        public async Task<Promocion?> ObtenerPromocionVigentePorProducto(long productoId)
        {
            return await _miDbContext.ProductopPromocion
                .Where(pp => pp.Producto_id == productoId &&
                             pp.Promocion!.Fech_ini <= DateTime.UtcNow &&
                             pp.Promocion.Fecha_final >= DateTime.UtcNow)
                .Select(pp => pp.Promocion)
                .FirstOrDefaultAsync();
        }
        [NonAction]
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
