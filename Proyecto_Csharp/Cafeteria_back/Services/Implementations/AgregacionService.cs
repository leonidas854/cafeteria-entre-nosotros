using Cafeteria_back.DTOs;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Services.Interfaces;
using Cafeteria_back.Custom;
using Microsoft.EntityFrameworkCore;
using Cafeteria_back.Exceptions;

namespace Cafeteria_back.Services.Implementations
{
    public class AgregacionService : IAgregacionService
    {
        private readonly MiDbContext _context;
        private readonly IUtilidades _utilidades;

        public AgregacionService(MiDbContext context, IUtilidades utilidades)
        {
            _context = context;
            _utilidades = utilidades;
        }

        public async Task<IEnumerable<string>> GetCategoriasAsync()
        {
            return await _context.Productos
                .Where(p => p.Categoria != null)
                .Select(p => p.Categoria!)
                .Distinct()
                .ToListAsync();
        }

        public async Task<IEnumerable<string>> GetSubcategoriasAsync(string categoria)
        {
            if (string.IsNullOrWhiteSpace(categoria))
                throw new BadRequestException("Debe proporcionar una categoría.");

            return await _context.Productos
                .Where(p => p.Categoria == categoria && p.Sub_categoria != null)
                .Select(p => p.Sub_categoria!)
                .Distinct()
                .ToListAsync();
        }

        public async Task<object> GetSaboresAsync()
        {
            return await _context.Productos
                .Where(p => p.Sabores != null)
                .Select(p => new { p.Categoria, p.Sabores })
                .Distinct()
                .ToListAsync();
        }

        public async Task<IEnumerable<string>> GetRolesAsync()
        {
            return await _context.Empleados
                .Where(r => r.Rol != null)
                .Select(r => r.Rol!)
                .Distinct()
                .ToListAsync();
        }

        public async Task<object> GetProductosAsync()
        {
            return await _context.Productos
                .Where(r => r.Estado == true && r.Nombre != null)
                .Select(r => new ProductoDTO__
                {
                    Id_producto = r.Id_producto,
                    Nombre = r.Nombre!
                })
                .ToListAsync();
        }

        public async Task<string?> ConfirmarAsync(string contra, long clienteId)
        {
            return await _context.Empleados
                .Where(u => u.Password == _utilidades.EncriptarSHA256(contra) && u.Id_user == clienteId)
                .Select(u => u.Nombre)
                .FirstOrDefaultAsync();
        }
    }
}
