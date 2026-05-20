using Cafeteria_back.DTOs;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Custom;
using Microsoft.EntityFrameworkCore;
using Cafeteria_back.Services.Interfaces;

namespace Cafeteria_back.Services.Implementations
{
    public class UsuariosService : IUsuariosService
    {
        private readonly MiDbContext _context;
        private readonly IUtilidades _utilidades;

        public UsuariosService(MiDbContext context, IUtilidades utilidades)
        {
            _context = context;
            _utilidades = utilidades;
        }

        public async Task<IEnumerable<UsuarioPruebaDTO>> GetClientesAsync()
        {
            return await _context.Clientes.Select(e => new UsuarioPruebaDTO
            {
                nombre = e.Nombre!,
                apell_paterno = e.ApellidoPaterno!,
                apell_materno = e.ApellidoMaterno!,
                Ubicacion = e.Ubicacion,
                NIT = e.Nit,
                telefono = e.Telefono,
                latitud = e.Latitud,
                longitud = e.Longitud,
                usuario = e.Usuari!,
                password = _utilidades.EncriptarSHA256(e.Password!) // En una app real no se suele enviar la pass encriptada al front
            }).ToListAsync();
        }

        public async Task<IEnumerable<EmpleadoDTO>> GetEmpleadosAsync()
        {
            return await _context.Empleados.Select(e => new EmpleadoDTO
            {
                nombre = e.Nombre!,
                apell_paterno = e.ApellidoPaterno!,
                apell_materno = e.ApellidoMaterno!,
                Empleado_rol = e.Rol!,
                fecha_contrato = e.FechaContrato!,
                telefono = e.Telefono,
                usuario = e.Usuari!,
                password = _utilidades.EncriptarSHA256(e.Password!)
            }).ToListAsync();
        }

        public async Task<bool> ActualizarClienteAsync(string usuarioActual, UsuarioPruebaDTO cliente)
        {
            var clienteExistente = await _context.Clientes
                .FirstOrDefaultAsync(c => c.Usuari!.ToLower() == usuarioActual.ToLower());

            if (clienteExistente == null)
                throw new Exceptions.NotFoundException("Cliente no encontrado.");

            if (!string.Equals(clienteExistente.Usuari, cliente.usuario, StringComparison.OrdinalIgnoreCase))
            {
                bool usuarioYaExiste = await _context.Clientes
                    .AnyAsync(c => c.Usuari!.ToLower() == cliente.usuario.ToLower());

                if (usuarioYaExiste)
                    throw new Exceptions.BadRequestException("Ya existe un cliente con ese nombre de usuario.");
            }

            clienteExistente.Nombre = cliente.nombre;
            clienteExistente.ApellidoPaterno = cliente.apell_paterno;
            clienteExistente.ApellidoMaterno = cliente.apell_materno;
            clienteExistente.Telefono = cliente.telefono;
            clienteExistente.Nit = cliente.NIT;
            clienteExistente.Latitud = cliente.latitud;
            clienteExistente.Longitud = cliente.longitud;
            clienteExistente.Ubicacion = cliente.Ubicacion;
            clienteExistente.Usuari = cliente.usuario;
            clienteExistente.Password = _utilidades.EncriptarSHA256(cliente.password);

            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new Exception("Error al guardar los cambios del cliente.");
            }
        }

        public async Task<bool> ActualizarEmpleadoAsync(string usuarioActual, EmpleadoUpdateDTO empleadoUpdate)
        {
            var empleadoExistente = await _context.Empleados
                .FirstOrDefaultAsync(e => e.Usuari!.ToLower() == usuarioActual.ToLower());

            if (empleadoExistente == null)
                throw new Exceptions.NotFoundException("Empleado no encontrado.");

            empleadoExistente.Nombre = empleadoUpdate.nombre;
            empleadoExistente.ApellidoPaterno = empleadoUpdate.apell_paterno;
            empleadoExistente.ApellidoMaterno = empleadoUpdate.apell_materno;
            empleadoExistente.Telefono = empleadoUpdate.telefono;
            empleadoExistente.Rol = empleadoUpdate.Empleado_rol;

            if (!string.IsNullOrEmpty(empleadoUpdate.password))
            {
                empleadoExistente.Password = _utilidades.EncriptarSHA256(empleadoUpdate.password);
            }

            try
            {
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                throw new Exception("Error de concurrencia al guardar los cambios del empleado.");
            }
        }

        public async Task<bool> EliminarClienteAsync(string usuario)
        {
            var cliente = await _context.Clientes
                .FirstOrDefaultAsync(c => c.Usuari!.ToLower() == usuario.ToLower());

            if (cliente == null)
                throw new Exceptions.NotFoundException("Cliente no encontrado.");

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> EliminarEmpleadoAsync(string usuario)
        {
            var empleado = await _context.Empleados
                .FirstOrDefaultAsync(e => e.Usuari!.ToLower() == usuario.ToLower());

            if (empleado == null)
                throw new Exceptions.NotFoundException("Empleado no encontrado.");

            _context.Empleados.Remove(empleado);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
