using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Custom;
using Cafeteria_back.Entities.DTOs;

using Cafeteria_back.Repositories.Implementations;
using Cafeteria_back.Repositories.Interfaces;


namespace Cafeteria_back.Controllers
{
   
    [Route("/[controller]")]
    [AllowAnonymous]
    [ApiController]
    public class AccesoController : ControllerBase
    {
        private readonly MiDbContext _context;
        private readonly Utilidades _utilidades;
        private readonly IGeolocalizador _geolocalizador;
        public AccesoController(MiDbContext context, Utilidades utilidades, IGeolocalizador geoLocalizador)
        {
            _context = context;
            _utilidades = utilidades;
            _geolocalizador = geoLocalizador;
        }

        [HttpPost]
        [Route("Registrarse_Cliente")]
        public async Task<IActionResult> Registrarse(UsuarioPruebaDTO prueba)
        {
            bool usuarioExiste = await _context.Clientes
        .AnyAsync(c => c.Usuari!.ToLower() == prueba.usuario.ToLower());

            if (usuarioExiste)
            {
                return Conflict(new { mensaje = "El nombre de usuario ya está en uso." });
            }
            var ModelCliente = new Cliente { 
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
            await _context.Clientes.AddAsync(ModelCliente);
            await _context.SaveChangesAsync();
            if (ModelCliente.Id_user != 0)
                return StatusCode(StatusCodes.Status200OK, new { isSuccess = true });
            else
                return StatusCode(StatusCodes.Status200OK, new { isSuccess = false });
        }
        [HttpPost]
        [Route("Registrar_Empleado")]
        public async Task<IActionResult>Registrar_E(EmpleadoDTO empleado)
        {
            bool usuarioExiste = await _context.Empleados
        .AnyAsync(c => c.Usuari!.ToLower() == empleado.usuario.ToLower());

            if (usuarioExiste)
            {
                return Conflict(new { mensaje = "El nombre de usuario ya está en uso." });
            }
            var ModelEmpleado = new Empleado
            {
                Nombre = empleado.nombre,
                ApellidoPaterno = empleado.apell_paterno,
                ApellidoMaterno = empleado.apell_materno,
                Telefono = empleado.telefono,
                Usuari = empleado.usuario,
                Password = _utilidades.EncriptarSHA256(empleado.password),
                FechaContrato = DateTime.UtcNow,
                Rol = empleado.Empleado_rol
            };
            await _context.Empleados.AddAsync(ModelEmpleado);
            await _context.SaveChangesAsync();
            if(ModelEmpleado.Id_user != 0)
                return StatusCode(StatusCodes.Status200OK,new { isSuccess = true });
            else
                return StatusCode(StatusCodes.Status200OK, new { isSuccess = false });

        }
        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO objeto)
        {
            try
            {
                var usuarioEncontrado = await _context.Clientes
                    .Where(u =>
                        u.Usuari == objeto.usuario &&
                        u.Password == _utilidades.EncriptarSHA256(objeto.password)
                    ).FirstOrDefaultAsync();

                if (usuarioEncontrado == null)
                {
                    return Ok(new { isSuccess = false, message = "Credenciales inválidas", token = "" });
                }

                var token = _utilidades.GenerarJWT(usuarioEncontrado);

                Response.Cookies.Append("jwt", token, new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false, 
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddHours(5)
                });

                return Ok(new
                {
                    isSuccess = true,
                    message = "Inicio de sesión exitoso",
                   
                });
            }
            catch (Exception )
            {
                
                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    isSuccess = false,
                    message = "Ocurrió un error interno.",
                    
                });
            }
        }

        [Authorize]
        [HttpPost]
        [Route("Logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt");
            return Ok(new
            {
                isSuccess = true,
                message = "Sesión cerrada exitosamente"
            });
        }

        [HttpPost]
        [Route("Login_Empleado")]
        public async Task<IActionResult> Login_empleado(LoginDTO objeto)
        {
            var usuarioEncontrado = await _context.Empleados
                .Where(u =>
                    u.Usuari == objeto.usuario &&
                    u.Password == _utilidades.EncriptarSHA256(objeto.password)
                ).FirstOrDefaultAsync();

            if (usuarioEncontrado == null)
            {
                return StatusCode(StatusCodes.Status200OK, new { isSuccess = false, token = "" });
            }
            else
            {
                Response.Cookies.Append("jwt", _utilidades.GenerarJWT(usuarioEncontrado), new CookieOptions
                {
                    HttpOnly = true,
                    Secure = false,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTimeOffset.UtcNow.AddHours(5)
                });
                return StatusCode(StatusCodes.Status200OK, new
                {
                    isSuccess = true,
                    Rol = usuarioEncontrado.Rol
                });
            }
        }
       

    }
}
