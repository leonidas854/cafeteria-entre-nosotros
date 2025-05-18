using Cafeteria_back.Custom;
using Cafeteria_back.Entities.DTOs;
using Cafeteria_back.Entities.Promociones;
using Cafeteria_back.Entities.Tablas_intermedias;
using Cafeteria_back.Repositories.Interfaces;
using Cafeteria_back.Repositorio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
   
    [ApiController]
    public class PromocionesController : Controller
    {
        private readonly MiDbContext _context;
        public PromocionesController(MiDbContext context)
        {
            _context = context;
           
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CrearPromocion([FromBody] PromocionDTO dto)
        {
            bool strategyExiste = await _context.Promociones
                .AnyAsync(p => p.Strategykey!.ToLower() == dto.Strategykey.ToLower());

            if (strategyExiste)
                return Conflict("Ya existe una promoción con ese Strategykey.");

            var productosEncontrados = await _context.Productos
                .Where(p => dto.Productos
                    .Select(np => np.ToLower())
                    .Contains(p.Nombre!.ToLower()))
                .ToListAsync();

            if (productosEncontrados.Count == 0)
                return BadRequest("La promoción debe estar asociada al menos a un producto válido.");

            var promocion = new Promocion
            {
                Descuento = dto.Descuento,
                Fech_ini = dto.Fech_ini.ToUniversalTime(),
                Fecha_final = dto.Fecha_final.ToUniversalTime(),
                Descripcion = dto.Descripcion,
                Strategykey = dto.Strategykey
            };

            promocion.Producto_promocion = new List<Producto_Promocion>();

            foreach (var producto in productosEncontrados)
            {
                promocion.Producto_promocion.Add(new Producto_Promocion
                {
                    Producto_id = producto.Id_producto
                });
            }
            _context.Promociones.Add(promocion);
            await _context.SaveChangesAsync();

            return Ok(new { isSuccess = true, strategykey = promocion.Strategykey });
        }


        [HttpGet]
        public async Task<ActionResult<IEnumerable<PromocionDTO>>> ObtenerPromociones()
        {
            var promociones = await _context.Promociones
                .Include(p => p.Producto_promocion!)
                    .ThenInclude(pp => pp.Producto)
                .ToListAsync();

            var resultado = promociones.Select(p => new PromocionDTO
            {
                Strategykey = p.Strategykey!,
                Descuento = p.Descuento!,
                Fech_ini = p.Fech_ini,
                Fecha_final = p.Fecha_final,
                Descripcion = p.Descripcion!,
                Productos = p.Producto_promocion!
                    .Select(pp => pp.Producto!.Nombre!)
                    .ToList()
            });

            return Ok(resultado);
        }



        [HttpPut("{strategykey}")]
        [Authorize]
        public async Task<IActionResult> EditarPromocion(string strategykey, [FromBody] PromocionDTO dto)
        {
            var promocion = await _context.Promociones
                .Include(p => p.Producto_promocion)
                .FirstOrDefaultAsync(p => p.Strategykey!.ToLower() == strategykey.ToLower());

            if (promocion == null)
                return NotFound("Promoción no encontrada.");

            if (!string.Equals(promocion.Strategykey, dto.Strategykey, StringComparison.OrdinalIgnoreCase))
            {
                bool claveRepetida = await _context.Promociones
                    .AnyAsync(p => p.Strategykey!.ToLower() == dto.Strategykey.ToLower());

                if (claveRepetida)
                    return Conflict("Ya existe otra promoción con ese Strategykey.");
            }

            
            var productos = await _context.Productos
                .Where(p => dto.Productos
                    .Select(n => n.ToLower())
                    .Contains(p.Nombre!.ToLower()))
                .ToListAsync();

            if (productos.Count == 0)
                return BadRequest("Debe asociarse al menos un producto válido.");

          
            promocion.Descuento = dto.Descuento;
            promocion.Fech_ini = dto.Fech_ini.ToUniversalTime();
            promocion.Fecha_final = dto.Fecha_final.ToUniversalTime();
            promocion.Descripcion = dto.Descripcion;
            promocion.Strategykey = dto.Strategykey;

            promocion.Producto_promocion!.Clear();
            foreach (var producto in productos)
            {
                promocion.Producto_promocion.Add(new Producto_Promocion
                {
                    Producto_id = producto.Id_producto,
                    Promocion_id = promocion.Id_promocion
                });
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{strategykey}")]
        [Authorize]
        public async Task<IActionResult> EliminarPromocion(string strategykey)
        {
            var promocion = await _context.Promociones
                .Include(p => p.Producto_promocion)
                .FirstOrDefaultAsync(p => p.Strategykey!.ToLower() == strategykey.ToLower());

            if (promocion == null)
                return NotFound("Promoción no encontrada.");

            _context.Promociones.Remove(promocion);
            await _context.SaveChangesAsync();

            return NoContent();
        }





    }
}
