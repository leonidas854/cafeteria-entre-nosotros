using Cafeteria_back.Repositorio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cafeteria_back.Entities.DTOs;
using Cafeteria_back.Entities.Productos;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    //[Authorize]
    [ApiController]
    public class ProductoController : Controller
    {
        private readonly MiDbContext _context;
       public ProductoController(MiDbContext miDbContext) { 
            _context = miDbContext;
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CrearProducto([FromBody] ProductoDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nombre))
                return BadRequest("El nombre del producto no puede estar vacío.");

          
            bool nombreYaExiste = await _context.Productos
                .AnyAsync(p => p.Nombre!.ToLower() == dto.Nombre.ToLower());

            if (nombreYaExiste)
                return Conflict("Ya existe un producto con ese nombre.");
            var producto = new Producto
            {
                Tipo = dto.Tipo,
                Categoria = dto.Categoria,
                Sub_categoria = dto.Sub_categoria,
                Descripcion = dto.Descripcion,
                Nombre = dto.Nombre,
                Precio = dto.Precio,
                Estado = dto.Estado,
                Sabores = dto.Sabores,
                Image_url = dto.Image_url
            };

            await _context.Productos.AddAsync(producto);
            await _context.SaveChangesAsync(); 

            if (dto.Tipo?.ToLower() == "bebida")
            {
                var bebida = new Bebida
                {
                    Id_producto = producto.Id_producto,
                    Tamanio = dto.Tamanio
                };
                _context.Bebidas.Add(bebida);
            }
            else if (dto.Tipo?.ToLower() == "comida")
            {
                var comida = new Comida
                {
                    Id_producto = producto.Id_producto,
                    Proporcion = dto.Proporcion
                };
                _context.Comidas.Add(comida);
            }

            await _context.SaveChangesAsync();
            return Ok(new { isSuccess = true, id = producto.Id_producto });
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductoDTO>>> ObtenerProductos()
        {
            var productos = await _context.Productos.ToListAsync();
            var bebidas = await _context.Bebidas.ToListAsync();
            var comidas = await _context.Comidas.ToListAsync();

            var resultado = productos.Select(p =>
            {
                var dto = new ProductoDTO
                {
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

                if (p.Tipo?.ToLower() == "bebida")
                    dto.Tamanio = bebidas.FirstOrDefault(b => b.Id_producto == p.Id_producto)?.Tamanio;

                if (p.Tipo?.ToLower() == "comida")
                    dto.Proporcion = comidas.FirstOrDefault(c => c.Id_producto == p.Id_producto)?.Proporcion;

                return dto;
            });

            return Ok(resultado);
        }
        [HttpPut("nombre/{nombre}")]
        [Authorize]
        public async Task<IActionResult> ActualizarProducto(string nombre, [FromBody] ProductoDTO dto)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                return BadRequest("El nombre del producto no puede estar vacío.");

            var producto = await _context.Productos
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

            producto.Tipo = dto.Tipo;
            producto.Categoria = dto.Categoria;
            producto.Sub_categoria = dto.Sub_categoria;
            producto.Descripcion = dto.Descripcion;
            producto.Nombre = dto.Nombre;
            producto.Precio = dto.Precio;
            producto.Estado = dto.Estado;
            producto.Sabores = dto.Sabores;
            producto.Image_url = dto.Image_url;

            var idProducto = producto.Id_producto;

           
            if (dto.Tipo?.ToLower() == "bebida")
            {
                var bebida = await _context.Bebidas.FirstOrDefaultAsync(b => b.Id_producto == idProducto);
                if (bebida == null)
                    _context.Bebidas.Add(new Bebida { Id_producto = idProducto, Tamanio = dto.Tamanio });
                else
                    bebida.Tamanio = dto.Tamanio;

               
                var comida = await _context.Comidas.FirstOrDefaultAsync(c => c.Id_producto == idProducto);
                if (comida != null)
                    _context.Comidas.Remove(comida);
            }
            else if (dto.Tipo?.ToLower() == "comida")
            {
                var comida = await _context.Comidas.FirstOrDefaultAsync(c => c.Id_producto == idProducto);
                if (comida == null)
                    _context.Comidas.Add(new Comida { Id_producto = idProducto, Proporcion = dto.Proporcion });
                else
                    comida.Proporcion = dto.Proporcion;

              
                var bebida = await _context.Bebidas.FirstOrDefaultAsync(b => b.Id_producto == idProducto);
                if (bebida != null)
                    _context.Bebidas.Remove(bebida);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }


        [HttpDelete("nombre/{nombre}")]
        [Authorize]
        public async Task<IActionResult> EliminarProducto(string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                return BadRequest("El nombre del producto no puede estar vacío.");

            var producto = await _context.Productos
                .FirstOrDefaultAsync(p => p.Nombre!.ToLower() == nombre.ToLower());

            if (producto == null)
                return NotFound("Producto no encontrado.");

         
            var bebida = await _context.Bebidas.FirstOrDefaultAsync(b => b.Id_producto == producto.Id_producto);
            if (bebida != null)
                _context.Bebidas.Remove(bebida);

            var comida = await _context.Comidas.FirstOrDefaultAsync(c => c.Id_producto == producto.Id_producto);
            if (comida != null)
                _context.Comidas.Remove(comida);

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();

            return NoContent();
        }

    }
}
