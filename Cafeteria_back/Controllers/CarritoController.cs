using Cafeteria_back.Entities.Carritos;
using Cafeteria_back.Entities.Promociones;
using Cafeteria_back.Repositorio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        [NonAction]
        public async Task<Promocion?> ObtenerPromocionVigentePorProducto(long productoId)
        {
            return await _miDbContext.ProductopPromocion
                .Where(pp => pp.Producto_id == productoId &&
                             pp.Promocion!.Fech_ini <= DateTime.Now &&
                             pp.Promocion.Fecha_final >= DateTime.Now)
                .Select(pp => pp.Promocion)
                .FirstOrDefaultAsync();
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
            long clienteId;
            try
            {
                clienteId = ObtenerClienteIdDesdeToken();
            }
            catch
            {
                return Unauthorized("Token inválido o faltan claims.");
            }

            var carrito = await _carritoService.ObtenerPorCliente(clienteId);
            if (carrito == null)
                return NotFound();


            foreach (var item in carrito.Items)
            {
                var promocion = await ObtenerPromocionVigentePorProducto(item.ProductoId);
                if (promocion != null)
                {
                    item.TienePromocion = true;
                    item.PrecioPromocional = item.PrecioUnitario * (1 - promocion.Descuento);
                    item.DescripcionPromocion = promocion.Descripcion;
                }
            }

            return Ok(carrito);
        }


        [HttpPost("agregar")]
        public async Task<IActionResult> Agregar([FromBody] Carrito carrito)
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

            carrito.ClienteId = clienteId;

            var carritoExistente = await _carritoService.ObtenerPorCliente(clienteId);

            if (carritoExistente == null)
            {
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

                await _carritoService.Actualizar(carritoExistente.Id!, carritoExistente);
            }

            return Ok();
        }


        [HttpPut("modificar-cantidad")]
        public async Task<IActionResult> ModificarCantidad([FromBody] ModificarCantidadDto dto)
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

            var carrito = await _carritoService.ObtenerPorCliente(clienteId);
            if (carrito == null) return NotFound();

            var item = carrito.Items.FirstOrDefault(i =>
                i.ProductoId == dto.ProductoId &&
                i.Extras.Count == dto.ExtraIds.Count &&
                !i.Extras.Select(e => e.ExtraId).Except(dto.ExtraIds).Any());

            if (item == null) return NotFound("Ítem no encontrado.");

            item.Cantidad = dto.NuevaCantidad;

            await _carritoService.Actualizar(carrito.Id!, carrito);
            return Ok(carrito);
        }

        [HttpPut("modificar-extras")]
        public async Task<IActionResult> ModificarExtras([FromBody] ModificarExtrasDto dto)
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

            var carrito = await _carritoService.ObtenerPorCliente(clienteId);
            if (carrito == null) return NotFound();

            var item = carrito.Items.FirstOrDefault(i => i.ProductoId == dto.ProductoId);
            if (item == null) return NotFound("Producto no encontrado en el carrito.");

            item.Extras = dto.NuevosExtras;

            await _carritoService.Actualizar(carrito.Id!, carrito);
            return Ok(carrito);
        }

        [HttpDelete("quitar-producto")]
        public async Task<IActionResult> QuitarProducto([FromBody] QuitarProductoDto dto)
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

            var carrito = await _carritoService.ObtenerPorCliente(clienteId);
            if (carrito == null) return NotFound();

            carrito.Items.RemoveAll(i =>
                i.ProductoId == dto.ProductoId &&
                i.Extras.Select(e => e.ExtraId).OrderBy(x => x)
                    .SequenceEqual(dto.ExtraIds.OrderBy(x => x)));

            await _carritoService.Actualizar(carrito.Id!, carrito);
            return Ok(carrito);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(string id)
        {
            await _carritoService.Eliminar(id);
            return Ok();
        }
    }
}
