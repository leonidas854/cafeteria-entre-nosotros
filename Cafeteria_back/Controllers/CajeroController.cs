using Cafeteria_back.Custom;
using Cafeteria_back.Entities.Carritos;
using Cafeteria_back.Entities.DTOs;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Repositories.Interfaces;
using Cafeteria_back.Repositorio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria_back.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CajeroController : Controller
    {

        private readonly MiDbContext _context;
        private readonly Utilidades _utilidades;

        public CajeroController( MiDbContext miDbContext, Utilidades utilidades)
        {
          
            _context = miDbContext;
            _utilidades = utilidades;
        }

        [HttpGet("nit/{nit}")]
        public async Task<IActionResult> BuscarClientePorNIT(int nit)
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

            if (cliente == null)
            {
                return NotFound("Cliente no encontrado con ese NIT.");
            }

            return Ok(cliente);
        }

        [HttpPost]
        [Route("Registrar")]
        public async Task<IActionResult> Registrarse(UsuarioNit prueba)
        {
            bool usuarioExiste = await _context.Clientes
                .AnyAsync(c => c.Usuari!.ToLower() == prueba.usuario.ToLower());

            if (usuarioExiste)
            {
                return Conflict(new { mensaje = "El nombre de usuario ya está en uso." });
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
                return Conflict(new { mensaje = "El nombre de usuario ya está en uso (concurrencia)." });
            }


            if (ModelCliente.Id_user != 0)
            {
                var clienteDto = new
                {
                    id = ModelCliente.Id_user,
                    apell_paterno = ModelCliente.ApellidoPaterno,
                    NIT = ModelCliente.Nit,
                    usuario = ModelCliente.Usuari,
                    password = ModelCliente.Password
                };

                return Ok(new
                {
                    isSuccess = true,
                    cliente = clienteDto
                });
            }
            else
            {
                return Ok(new { isSuccess = false });
            }
        }
    }
}
