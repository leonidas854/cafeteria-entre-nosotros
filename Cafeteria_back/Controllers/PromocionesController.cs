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
        [Consumes("multipart/form-data")]
       
        public async Task<IActionResult> CrearPromocion([FromForm] PromocionDTO dto)
        {
           
            if (await _context.Promociones.AnyAsync(p => p.Strategykey!.ToLower() == dto.Strategykey.ToLower()))
                return Conflict("Ya existe una promoción con ese Strategykey.");

          
            if (dto.Productos == null || !dto.Productos.Any())
                return BadRequest("Debe asociar al menos un producto válido.");

        
            var productosEncontrados = await _context.Productos
                .Where(p => dto.Productos.Contains(p.Id_producto))
                .ToListAsync();

            if (!productosEncontrados.Any())
                return BadRequest("No se encontraron productos con los IDs proporcionados.");

           
            string? imagenURL = null;
            if (dto.Imagen != null && dto.Imagen.Length > 0)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "Promociones");
                Directory.CreateDirectory(folderPath);

                var extension = Path.GetExtension(dto.Imagen.FileName);
                var safeFileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(folderPath, safeFileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Imagen.CopyToAsync(stream);
                }

                imagenURL = $"/Promociones/{safeFileName}";
            }

          
            var promocion = new Promocion
            {
                Descuento = dto.Descuento,
                Fech_ini = dto.Fech_ini.ToUniversalTime(),
                Fecha_final = dto.Fecha_final.ToUniversalTime(),
                Descripcion = dto.Descripcion,
                Strategykey = dto.Strategykey,
                Url_imagen = imagenURL,
                Producto_promocion = productosEncontrados.Select(p => new Producto_Promocion
                {
                    Producto_id = p.Id_producto
                }).ToList()
            };

         
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Promociones.Add(promocion);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error al crear promoción. Detalle: {ex.Message}");
            }

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
                id = p.Id_promocion,
                Strategykey = p.Strategykey!,
                Descuento = p.Descuento!,
                Fech_ini = p.Fech_ini,
                Fecha_final = p.Fecha_final,
                Descripcion = p.Descripcion!,
                Productos = p.Producto_promocion!
                        .Select(pp => pp.Producto!.Id_producto)
                        .ToList(),

                Url_imagen = p.Url_imagen,
            });

            return Ok(resultado);
        }

        [HttpGet("todas")]
        public async Task<ActionResult<IEnumerable<PromocionTodoDTO>>> ObtenerTodasLasPromociones()
        {
            var promociones = await _context.Promociones
             
               .Include(p => p.Producto_promocion!)
                   .ThenInclude(pp => pp.Producto)
               .ToListAsync();

          
            var resultado = promociones.Select(p => new PromocionTodoDTO
            {
                id = p.Id_promocion,
                Strategykey = p.Strategykey!,
                Descuento = p.Descuento,
                Fech_ini = p.Fech_ini,
                Fecha_final = p.Fecha_final,
                Descripcion = p.Descripcion!,
                Url_imagen = p.Url_imagen,

               
                Productos = p.Producto_promocion!
                    .Select(pp => new ProductoDto
                    {
                        Id = pp.Producto!.Id_producto,
                        Nombre = pp.Producto.Nombre!,
                        Precio = pp.Producto.Precio,
                        Categoria = pp.Producto.Categoria,
                        ImageUrl = pp.Producto.Image_url
                    })
                    .ToList()
            });

           
            return Ok(resultado);
        }







        [HttpPut("{strategykey}")]
        [Authorize]
        [Consumes("application/json")]
        public async Task<IActionResult> EditarPromocion(string strategykey, [FromBody] PromocionDTO dto)
        {
            var promocion = await _context.Promociones
                .Include(p => p.Producto_promocion)
                .FirstOrDefaultAsync(p => p.Strategykey!.ToLower() == strategykey.ToLower());

            if (promocion == null)
                return NotFound("Promoción no encontrada.");

            if (!string.Equals(promocion.Strategykey, dto.Strategykey, StringComparison.OrdinalIgnoreCase))
            {
                var existe = await _context.Promociones.AnyAsync(p => p.Strategykey!.ToLower() == dto.Strategykey.ToLower());
                if (existe)
                    return Conflict("Ya existe otra promoción con ese Strategykey.");
            }

            if (dto.Productos == null || !dto.Productos.Any())
                return BadRequest("Debe asociarse al menos un producto válido.");

            var productosValidos = await _context.Productos
                .Where(p => dto.Productos.Contains(p.Id_producto))
                .ToListAsync();

            if (!productosValidos.Any())
                return BadRequest("No se encontraron productos válidos.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                promocion.Descuento = dto.Descuento;
                promocion.Fech_ini = dto.Fech_ini.ToUniversalTime();
                promocion.Fecha_final = dto.Fecha_final.ToUniversalTime();
                promocion.Descripcion = dto.Descripcion;
                promocion.Strategykey = dto.Strategykey;

                promocion.Producto_promocion!.Clear();
                foreach (var prod in productosValidos)
                {
                    promocion.Producto_promocion.Add(new Producto_Promocion
                    {
                        Producto_id = prod.Id_producto,
                        Promocion_id = promocion.Id_promocion
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error al editar la promoción. Detalle: {ex.Message}");
            }

            return Ok(new { isSuccess = true, strategykey = promocion.Strategykey });
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

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Promociones.Remove(promocion);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error al eliminar la promoción. Detalle: {ex.Message}");
            }

            return Ok(new { isSuccess = true, message = "Promoción eliminada correctamente." });
        }






    }
}
