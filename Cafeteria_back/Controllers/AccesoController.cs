using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Custom;
using Cafeteria_back.Entities.DTOs;
using Cafeteria_back.Entities.Usuarios.Clientes;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    [ApiController]
    public class AccesoController : ControllerBase
    {
        private readonly MiDbContext _context;
        private readonly Utilidades _utilidades;
        public AccesoController(MiDbContext context, Utilidades utilidades)
        {
            _context = context;
            _utilidades = utilidades;
        }
        [HttpPost]
        [Route("Registrarse")]
        public async Task<IActionResult> Registrarse(UsuarioPruebaDTO prueba)
        {
            var ModelCliente = new Cliente { 
                Nombre = prueba.nombre,
                Usuari = prueba.usuario,
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
