using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Custom;
using Cafeteria_back.Entities.DTOs;
using Cafeteria_back.Entities.Usuarios.Clientes;
using Cafeteria_back.Repositories.Implementations;
using Cafeteria_back.Repositories.Interfaces;

namespace Cafeteria_back.Controllers
{
    //api 
    //AIzaSyAFGecad0uizurpdb1U4R6KPG_SJdQRkmU
    [Route("api/[controller]")]
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
        [Route("Registrarse")]
        public async Task<IActionResult> Registrarse(UsuarioPruebaDTO prueba)
        {
           

            var ModelCliente = new Cliente { 
                Nombre = prueba.nombre,
                ApellidoPaterno = prueba.apell_paterno,
                ApellidoMaterno = prueba.apell_materno,
                Telefono = prueba.telefono,
                Nit = prueba.NIT,
                Latitud = prueba.latitud,
                Longitud = prueba.longitud,
                Usuari = prueba.usuario,
                Ubicacion = _geolocalizador.ObtenerDireccion(prueba.latitud, prueba.longitud),
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
        [Route("Login")]
        public async Task<IActionResult> Login(LoginDTO objeto)
        {
            var usuarioEncontrado = await _context.Clientes
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
                return StatusCode(StatusCodes.Status200OK, new
                {
                    isSuccess = true,
                    token = _utilidades.generarJWT(usuarioEncontrado)
                });
            }
        }

    }
}
