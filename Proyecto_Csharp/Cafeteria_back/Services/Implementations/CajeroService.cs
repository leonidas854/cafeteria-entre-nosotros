using Cafeteria_back.DTOs;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Services.Interfaces;
using Cafeteria_back.Custom;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;

namespace Cafeteria_back.Services.Implementations
{
    public class CajeroService : ICajeroService
    {
        private readonly MiDbContext _context;
        private readonly IUtilidades _utilidades;

        public CajeroService(MiDbContext context, IUtilidades utilidades)
        {
            _context = context;
            _utilidades = utilidades;
        }

        public async Task<UsuarioNit?> BuscarClientePorNITAsync(int nit)
        {
            var cliente = await _context.Clientes
                .Where(c => c.Nit == nit)
                .Select(c => new UsuarioNit
                {
                    id = c.Id_user,
                    apell_paterno = c.ApellidoPaterno!,
                    NIT = c.Nit,
                    usuario = c.Usuari!,
                    password = _utilidades.EncriptarSHA256(c.Password!)
                })
                .FirstOrDefaultAsync();

            return cliente;
        }

        public async Task<object?> ActualizarApellidoPorNITAsync(int nit, string nuevoApellido)
        {
            var cliente = await _context.Clientes.FirstOrDefaultAsync(c => c.Nit == nit);

            if (cliente == null)
            {
                throw new Exceptions.NotFoundException("Cliente no encontrado con ese NIT.");
            }

            cliente.ApellidoPaterno = nuevoApellido;

            try
            {
                await _context.SaveChangesAsync();
                return new
                {
                    cliente.Id_user,
                    cliente.Nit,
                    cliente.ApellidoPaterno
                };
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<object?> RegistrarseAsync(UsuarioNit prueba)
        {
            bool usuarioExiste = await _context.Clientes
                .AnyAsync(c => c.Usuari!.ToLower() == prueba.usuario.ToLower());

            if (usuarioExiste)
            {
                throw new Exceptions.BadRequestException("El nombre de usuario ya está en uso.");
            }

            var ModelCliente = new Cliente
            {
                ApellidoPaterno = prueba.apell_paterno,
                Nit = prueba.NIT,
                Usuari = prueba.usuario,
                Password = _utilidades.EncriptarSHA256(prueba.password)
            };

            try
            {
                await _context.Clientes.AddAsync(ModelCliente);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                throw new Exceptions.BadRequestException("El nombre de usuario ya está en uso (concurrencia).");
            }

            if (ModelCliente.Id_user != 0)
            {
                return new
                {
                    id = ModelCliente.Id_user,
                    apell_paterno = ModelCliente.ApellidoPaterno,
                    NIT = ModelCliente.Nit,
                    usuario = ModelCliente.Usuari,
                    password = ModelCliente.Password
                };
            }
            else
            {
                return null;
            }
        }
    }
}
