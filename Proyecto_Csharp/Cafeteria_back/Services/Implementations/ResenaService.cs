using Cafeteria_back.DTOs;
using Cafeteria_back.Entities.Resenas;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Cafeteria_back.Exceptions;

namespace Cafeteria_back.Services.Implementations
{
    public class ResenaService : IResenaService
    {
        private readonly MiDbContext _context;

        public ResenaService(MiDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CrearResenaAsync(resenaDTO resen, long usuarioId)
        {
            var clienteExiste = await _context.Clientes.AnyAsync(c => c.Id_user == usuarioId);
            if (!clienteExiste)
                throw new BadRequestException("El cliente del token no existe en la base de datos.");

            var productoexiste = await _context.Productos.AnyAsync(p => p.Id_producto == resen.Producto_id);
            if (!productoexiste)
                throw new BadRequestException("El producto no existe en la base de datos.");

            var resena = new Resena
            {
                comentario = resen.comentario,
                puntuacion = resen.puntuacion,
                Fech_resena = DateTime.UtcNow,
                Cliente_id = usuarioId,
                Producto_id = resen.Producto_id
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Resena.Add(resena);
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
