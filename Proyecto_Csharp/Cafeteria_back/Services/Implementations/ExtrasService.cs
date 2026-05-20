using Cafeteria_back.DTOs;
using Cafeteria_back.Entities.Extras;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria_back.Services.Implementations
{
    public class ExtrasService : IExtrasService
    {
        private readonly MiDbContext _context;

        public ExtrasService(MiDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ExtraDTO>> GetExtrasAsync()
        {
            return await _context.Extras
                .Select(e => new ExtraDTO
                {
                    id = e.Id_extra,
                    Nombre = e.Name,
                    precio = e.Precio
                })
                .ToListAsync();
        }

        public async Task<ExtraDTO?> GetExtraPorNombreAsync(string nombre)
        {
            var extra = await _context.Extras
                .FirstOrDefaultAsync(e => e.Name == nombre);

            if (extra == null)
                return null;

            return new ExtraDTO
            {
                id = extra.Id_extra,
                Nombre = extra.Name,
                precio = extra.Precio
            };
        }

        public async Task<bool> ActualizarExtraAsync(string nombre, ExtraDTO extraDto)
        {
            var extraExistente = await _context.Extras
                .FirstOrDefaultAsync(e => e.Name!.ToLower() == nombre.ToLower());
            
            if (extraExistente == null)
                throw new Exceptions.NotFoundException("Extra no encontrado.");

            if (!string.Equals(extraExistente.Name, extraDto.Nombre, StringComparison.OrdinalIgnoreCase))
            {
                bool nombreYaExiste = await _context.Extras
                    .AnyAsync(e => e.Name!.ToLower() == extraDto.Nombre!.ToLower());

                if (nombreYaExiste)
                    throw new Exceptions.BadRequestException("Ya existe un Extra con ese nombre.");
            }

            extraExistente.Name = extraDto.Nombre;
            extraExistente.Precio = extraDto.precio;

            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new Exception("Error de concurrencia al guardar los cambios.");
            }
        }

        public async Task<bool> CrearExtraAsync(ExtraDTO extraDto)
        {
            bool nombreYaExiste = await _context.Extras
                .AnyAsync(e => e.Name!.ToLower() == extraDto.Nombre!.ToLower());

            if (nombreYaExiste)
                throw new Exceptions.BadRequestException("Ya existe un Extra con ese nombre.");

            var modeloExtra = new Extra
            {
                Name = extraDto.Nombre,
                Precio = extraDto.precio
            };

            await _context.Extras.AddAsync(modeloExtra);
            await _context.SaveChangesAsync();

            return modeloExtra.Id_extra != 0;
        }

        public async Task<bool> EliminarExtraAsync(string nombre)
        {
            var extra = await _context.Extras
                .FirstOrDefaultAsync(e => string.Equals(e.Name, nombre, StringComparison.OrdinalIgnoreCase));

            if (extra == null)
                throw new Exceptions.NotFoundException("Extra no encontrado.");

            _context.Extras.Remove(extra);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
