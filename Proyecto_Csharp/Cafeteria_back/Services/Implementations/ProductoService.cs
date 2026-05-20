using Cafeteria_back.DTOs;
using Cafeteria_back.Entities.Productos;
using Cafeteria_back.Repositorio;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria_back.Services.Implementations
{
    public class ProductoService : Interfaces.IProductoService
    {
        private readonly MiDbContext _context;

        public ProductoService(MiDbContext context)
        {
            _context = context;
        }

        public async Task<long> CrearProductoAsync(ProductoDTO dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Nombre))
                throw new Exceptions.BadRequestException("El nombre del producto no puede estar vacío.");

            bool nombreYaExiste = await _context.Productos
                .AnyAsync(p => p.Nombre!.ToLower() == dto.Nombre.ToLower());

            if (nombreYaExiste)
                throw new Exceptions.BadRequestException("Ya existe un producto con ese nombre.");

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
                    Estado = dto.Estado,
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
                    Estado = dto.Estado,
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
                    Estado = dto.Estado,
                    Sabores = dto.Sabores,
                    Image_url = imageUrl
                };
            }

            await _context.Productos.AddAsync(producto);
            await _context.SaveChangesAsync();

            return producto.Id_producto;
        }

        public async Task<IEnumerable<ProductoDTO_>> ObtenerProductosActivosAsync()
        {
            var productos = await _context.Productos.Where(p => p.Estado == true).ToListAsync();

            return productos.Select(p => MapearA_DTO(p));
        }

        public async Task<IEnumerable<ProductoDTO_>> ObtenerTodosProductosAsync()
        {
            var productos = await _context.Productos.ToListAsync();

            return productos.Select(p => MapearA_DTO(p));
        }

        public async Task<ProductoDTO_?> ObtenerProductoPorIdAsync(long id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto == null)
                return null;

            return MapearA_DTO(producto);
        }

        public async Task<bool> ActualizarProductoAsync(string nombre, ProductoDTO dto)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new Exceptions.BadRequestException("El nombre del producto no puede estar vacío.");

            var producto = await _context.Productos
                .FirstOrDefaultAsync(p => p.Nombre!.ToLower() == nombre.ToLower());

            if (producto == null)
                throw new Exceptions.NotFoundException("Producto no encontrado.");

            if (!string.Equals(producto.Nombre, dto.Nombre, StringComparison.OrdinalIgnoreCase))
            {
                bool nombreYaExiste = await _context.Productos
                    .AnyAsync(p => p.Nombre!.ToLower() == dto.Nombre!.ToLower());

                if (nombreYaExiste)
                    throw new Exceptions.BadRequestException("Ya existe otro producto con ese nombre.");
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
            return true;
        }

        public async Task<bool> EliminarProductoAsync(string nombre)
        {
            if (string.IsNullOrWhiteSpace(nombre))
                throw new Exceptions.BadRequestException("El nombre del producto no puede estar vacío.");

            var producto = await _context.Productos
                .FirstOrDefaultAsync(p => p.Nombre!.ToLower() == nombre.ToLower());

            if (producto == null)
                throw new Exceptions.NotFoundException("Producto no encontrado.");

            _context.Productos.Remove(producto);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CambiarEstadoProductoAsync(long id, bool nuevoEstado)
        {
            var producto = await _context.Productos.FindAsync(id);

            if (producto == null)
                throw new Exceptions.NotFoundException("Producto no encontrado.");

            producto.Estado = nuevoEstado;
            await _context.SaveChangesAsync();
            return true;
        }

        private ProductoDTO_ MapearA_DTO(Producto p)
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
        }
    }
}
