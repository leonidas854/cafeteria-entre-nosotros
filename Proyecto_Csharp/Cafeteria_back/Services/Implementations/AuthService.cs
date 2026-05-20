using Cafeteria_back.DTOs;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Repositories.Interfaces;
using Cafeteria_back.Services.Interfaces;
using Cafeteria_back.Custom;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;

namespace Cafeteria_back.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly MiDbContext _context;
        private readonly IUtilidades _utilidades;
        private readonly IGeolocalizador _geolocalizador;

        public AuthService(MiDbContext context, IUtilidades utilidades, IGeolocalizador geolocalizador)
        {
            _context = context;
            _utilidades = utilidades;
            _geolocalizador = geolocalizador;
        }

        public async Task<bool> RegistrarClienteAsync(UsuarioPruebaDTO prueba)
        {
            bool usuarioExiste = await _context.Clientes
                .AnyAsync(c => c.Usuari!.ToLower() == prueba.usuario.ToLower());

            if (usuarioExiste)
                throw new Exceptions.BadRequestException("El nombre de usuario ya está en uso.");

            var modelCliente = new Cliente
            {
                Nombre = prueba.nombre,
                ApellidoPaterno = prueba.apell_paterno,
                ApellidoMaterno = prueba.apell_materno,
                Telefono = prueba.telefono,
                Nit = prueba.NIT,
                Latitud = prueba.latitud,
                Longitud = prueba.longitud,
                Usuari = prueba.usuario,
                Ubicacion = await _geolocalizador.ObtenerDireccion(prueba.latitud, prueba.longitud),
                Password = _utilidades.EncriptarSHA256(prueba.password)
            };

            try
            {
                await _context.Clientes.AddAsync(modelCliente);
                await _context.SaveChangesAsync();
                return modelCliente.Id_user != 0;
            }
            catch (DbUpdateException)
            {
                throw new Exceptions.BadRequestException("El nombre de usuario ya está en uso (concurrencia).");
            }
        }

        public async Task<bool> RegistrarEmpleadoAsync(EmpleadoDTO empleado)
        {
            bool usuarioExiste = await _context.Empleados
                .AnyAsync(c => c.Usuari!.ToLower() == empleado.usuario!.ToLower());

            if (usuarioExiste)
                throw new Exceptions.BadRequestException("El nombre de usuario ya está en uso.");

            var modelEmpleado = new Empleado
            {
                Nombre = empleado.nombre,
                ApellidoPaterno = empleado.apell_paterno,
                ApellidoMaterno = empleado.apell_materno,
                Telefono = empleado.telefono,
                Usuari = empleado.usuario,
                Password = _utilidades.EncriptarSHA256(empleado.password!),
                FechaContrato = DateTime.UtcNow,
                Rol = empleado.Empleado_rol
            };

            await _context.Empleados.AddAsync(modelEmpleado);
            await _context.SaveChangesAsync();
            return modelEmpleado.Id_user != 0;
        }

        public async Task<(bool IsSuccess, string Message, string Token)> LoginAsync(LoginDTO objeto)
        {
            var usuario = await _context.Clientes
                .FirstOrDefaultAsync(u => u.Usuari == objeto.usuario && u.Password == _utilidades.EncriptarSHA256(objeto.password));

            if (usuario == null)
                return (false, "Credenciales inválidas", string.Empty);

            var token = _utilidades.GenerarJWT(usuario);
            return (true, "Inicio de sesión exitoso", token);
        }

        public async Task<(bool IsSuccess, string Rol, string Token)> LoginEmpleadoAsync(LoginDTO objeto)
        {
            var usuario = await _context.Empleados
                .FirstOrDefaultAsync(u => u.Usuari == objeto.usuario && u.Password == _utilidades.EncriptarSHA256(objeto.password));

            if (usuario == null)
                return (false, string.Empty, string.Empty);

            var token = _utilidades.GenerarJWT(usuario);
            return (true, usuario.Rol ?? string.Empty, token);
        }

        public async Task<object?> ObtenerDatosUsuarioAsync(long id, string rol)
        {
            if (rol == "Cliente")
            {
                return await _context.Clientes.FirstOrDefaultAsync(c => c.Id_user == id);
            }
            else if (rol == "Empleado")
            {
                return await _context.Empleados.FirstOrDefaultAsync(e => e.Id_user == id);
            }
            
            return null;
        }
    }
}
