using Cafeteria_back.Repositorio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cafeteria_back.Entities.DTOs;
using Cafeteria_back.Entities.Productos;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    //[Authorize]
    [ApiController]
    public class ProductoController : Controller
    {
        private readonly MiDbContext _context;
        public ProductoController(MiDbContext miDbContext)
        {
            _context = miDbContext;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CrearProducto([FromForm] ProductoDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nombre))
                return BadRequest("El nombre del producto no puede estar vacío.");

            bool nombreYaExiste = await _context.Productos
                .AnyAsync(p => p.Nombre!.ToLower() == dto.Nombre.ToLower());

            if (nombreYaExiste)
                return Conflict("Ya existe un producto con ese nombre.");

            string imageUrl = null!;
            if (dto.Imagen != null && dto.Imagen.Length > 0)
            {
                var folderPath = Path.Combine("wwwroot", "imagenes");
                Directory.CreateDirectory(folderPath);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Imagen.FileName);
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Imagen.CopyToAsync(stream);
                }

                imageUrl = $"/imagenes/{fileName}";
            }

            Producto producto;
            if (dto.Tipo?.ToLower() == "comida")
            {
                producto = new Comida
                {
                    Proporcion = dto.Proporcion,
                    Tipo = dto.Tipo,
                    Categoria = dto.Categoria,
                    Sub_categoria = dto.Sub_categoria,
                    Descripcion = dto.Descripcion,
                    Nombre = dto.Nombre,
                    Precio = dto.Precio,
                    Estado = true,
                    Sabores = dto.Sabores,
                    Image_url = imageUrl
                };
            }
            else if (dto.Tipo?.ToLower() == "bebida")
            {
                producto = new Bebida
                {
                    Tamanio = dto.Tamanio,
                    Tipo = dto.Tipo,
                    Categoria = dto.Categoria,
                    Sub_categoria = dto.Sub_categoria,
                    Descripcion = dto.Descripcion,
                    Nombre = dto.Nombre,
                    Precio = dto.Precio,
                    Estado = true,
                    Sabores = dto.Sabores,
                    Image_url = imageUrl
                };
            }
            else
            {
                producto = new Producto
                {
                    Tipo = dto.Tipo,
                    Categoria = dto.Categoria,
                    Sub_categoria = dto.Sub_categoria,
                    Descripcion = dto.Descripcion,
                    Nombre = dto.Nombre,
                    Precio = dto.Precio,
                    Estado = true,
                    Sabores = dto.Sabores,
                    Image_url = imageUrl
                };
            }

            await _context.Productos.AddAsync(producto);
            await _context.SaveChangesAsync();

            return Ok(new { isSuccess = true, id = producto.Id_producto });
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoDTO>>> ObtenerProductos()
        {
            var productos = await _context.Productos.ToListAsync();

            var resultado = productos.Select(p =>
            {
                var dto = new ProductoDTO_
                {
                    id = p.Id_producto,
                    Tipo = p.Tipo,
                    Categoria = p.Categoria,
                    Sub_categoria = p.Sub_categoria,
                    Descripcion = p.Descripcion,
                    Nombre = p.Nombre,
                    Precio = p.Precio,
                    Estado = p.Estado,
                    Sabores = p.Sabores,
                    Image_url = p.Image_url
                };

                if (p is Bebida bebida)
                    dto.Tamanio = bebida.Tamanio;

                if (p is Comida comida)
                    dto.Proporcion = comida.Proporcion;

                return dto;
            });

            return Ok(resultado);
        }

        [HttpPut("nombre/{nombre}")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> ActualizarProducto(string nombre, [FromForm] ProductoDTO dto)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                return BadRequest("El nombre del producto no puede estar vacío.");

            Producto? producto = await _context.Productos
                .FirstOrDefaultAsync(p => p.Nombre!.ToLower() == nombre.ToLower());

            if (producto == null)
                return NotFound("Producto no encontrado.");

            if (!string.Equals(producto.Nombre, dto.Nombre, StringComparison.OrdinalIgnoreCase))
            {
                bool nombreYaExiste = await _context.Productos
                    .AnyAsync(p => p.Nombre!.ToLower() == dto.Nombre!.ToLower());

                if (nombreYaExiste)
                    return Conflict("Ya existe otro producto con ese nombre.");
            }

            if (dto.Imagen != null && dto.Imagen.Length > 0)
            {
                var folderPath = Path.Combine("wwwroot", "imagenes");
                Directory.CreateDirectory(folderPath);

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Imagen.FileName);
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await dto.Imagen.CopyToAsync(stream);
                }

                producto.Image_url = $"/imagenes/{fileName}";
            }

            producto.Tipo = dto.Tipo;
            producto.Categoria = dto.Categoria;
            producto.Sub_categoria = dto.Sub_categoria;
            producto.Descripcion = dto.Descripcion;
            producto.Nombre = dto.Nombre;
            producto.Precio = dto.Precio;
            producto.Estado = dto.Estado;
            producto.Sabores = dto.Sabores;

            if (producto is Comida comida)
            {
                comida.Proporcion = dto.Proporcion;
            }
            else if (producto is Bebida bebida)
            {
                bebida.Tamanio = dto.Tamanio;
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("nombre/{nombre}")]
        public async Task<IActionResult> EliminarProducto(string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                return BadRequest("El nombre del producto no puede estar vacío.");

            var producto = await _context.Productos
                .FirstOrDefaultAsync(p => p.Nombre!.ToLower() == nombre.ToLower());

            if (producto == null)
                return NotFound("Producto no encontrado.");

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
