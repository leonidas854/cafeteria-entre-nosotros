using Cafeteria_back.DTOs;
using Cafeteria_back.Entities.Promociones;
using Cafeteria_back.Entities.Tablas_intermedias;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria_back.Services.Implementations
{
    public class PromocionesService : IPromocionesService
    {
        private readonly MiDbContext _context;

        public PromocionesService(MiDbContext context)
        {
            _context = context;
        }

        public async Task<object?> CrearPromocionAsync(PromocionDTO dto)
        {
            if (await _context.Promociones.AnyAsync(p => p.Strategykey!.ToLower() == dto.Strategykey.ToLower()))
                throw new Exceptions.BadRequestException("Ya existe una promoción con ese Strategykey.");

            if (dto.Productos == null || !dto.Productos.Any())
                throw new Exceptions.BadRequestException("Debe asociar al menos un producto válido.");

            var productosEncontrados = await _context.Productos
                .Where(p => dto.Productos.Contains(p.Id_producto))
                .ToListAsync();

            if (!productosEncontrados.Any())
                throw new Exceptions.NotFoundException("No se encontraron productos con los IDs proporcionados.");

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
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new { strategykey = promocion.Strategykey };
        }

        public async Task<IEnumerable<PromocionDTO>> ObtenerPromocionesAsync()
        {
            var promociones = await _context.Promociones
                .Include(p => p.Producto_promocion!)
                    .ThenInclude(pp => pp.Producto)
                .ToListAsync();

            return promociones.Select(p => new PromocionDTO
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
        }

        public async Task<IEnumerable<PromocionTodoDTO>> ObtenerTodasLasPromocionesAsync()
        {
            var promociones = await _context.Promociones
               .Include(p => p.Producto_promocion!)
                   .ThenInclude(pp => pp.Producto)
               .ToListAsync();

            return promociones.Select(p => new PromocionTodoDTO
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
        }

        public async Task<object?> EditarPromocionAsync(string strategykey, PromocionDTO dto)
        {
            var promocion = await _context.Promociones
                .Include(p => p.Producto_promocion)
                .FirstOrDefaultAsync(p => p.Strategykey!.ToLower() == strategykey.ToLower());

            if (promocion == null)
                throw new Exceptions.NotFoundException("Promoción no encontrada.");

            if (!string.Equals(promocion.Strategykey, dto.Strategykey, StringComparison.OrdinalIgnoreCase))
            {
                var existe = await _context.Promociones.AnyAsync(p => p.Strategykey!.ToLower() == dto.Strategykey.ToLower());
                if (existe)
                    throw new Exceptions.BadRequestException("Ya existe otra promoción con ese Strategykey.");
            }

            if (dto.Productos == null || !dto.Productos.Any())
                throw new Exceptions.BadRequestException("Debe asociarse al menos un producto válido.");

            var productosValidos = await _context.Productos
                .Where(p => dto.Productos.Contains(p.Id_producto))
                .ToListAsync();

            if (!productosValidos.Any())
                throw new Exceptions.BadRequestException("No se encontraron productos válidos.");

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
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }

            return new { strategykey = promocion.Strategykey };
        }

        public async Task<bool> EliminarPromocionAsync(string strategykey)
        {
            var promocion = await _context.Promociones
                .Include(p => p.Producto_promocion)
                .FirstOrDefaultAsync(p => p.Strategykey!.ToLower() == strategykey.ToLower());

            if (promocion == null)
                throw new Exceptions.NotFoundException("Promoción no encontrada.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Promociones.Remove(promocion);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }
}
