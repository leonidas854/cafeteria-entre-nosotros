using Cafeteria_back.Custom;
using Cafeteria_back.Entities.DTOs;
using Cafeteria_back.Repositorio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class UsuariosController : Controller
    {
     private readonly MiDbContext _context;
        private readonly IUtilidades _utilidades;
        public UsuariosController(MiDbContext context, IUtilidades utilidades)
        {
            _context = context;
            _utilidades = utilidades;
        }
        [HttpGet("Clientes")]
        public async Task<ActionResult<IEnumerable<UsuarioPruebaDTO>>> GetClientes()
        {
            var Clientes = await _context.Clientes.Select(
                e => new UsuarioPruebaDTO
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
                    password = _utilidades.EncriptarSHA256(e.Password!)
                }).ToListAsync();
            return Ok(Clientes);
        }
        [HttpGet("Empleados")]
        public async Task<ActionResult<IEnumerable<EmpleadoDTO>>> GetEmpleado()
        {
            var empleados = await _context.Empleados.Select(
                e => new EmpleadoDTO
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
            return Ok(empleados);
        }
        [HttpPut("cliente/usuario/{usuarioActual}")]
        public async Task<IActionResult> PutCliente(string usuarioActual, UsuarioPruebaDTO cliente)
        {
            var clienteExistente = await _context.Clientes
                .FirstOrDefaultAsync(c => c.Usuari!.ToLower() == usuarioActual.ToLower());

            if (clienteExistente == null)
            {
                return NotFound("Cliente no encontrado.");
            }

            if (!string.Equals(clienteExistente.Usuari, cliente.usuario, StringComparison.OrdinalIgnoreCase))
            {
                bool usuarioYaExiste = await _context.Clientes
                    .AnyAsync(c => c.Usuari!.ToLower() == cliente.usuario.ToLower());

                if (usuarioYaExiste)
                {
                    return Conflict("Ya existe un cliente con ese nombre de usuario.");
                }
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
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Error al guardar los cambios del cliente.");
            }

            return NoContent();
        }
      

        [HttpPut("empleado/usuario/{usuarioActual}")]
        public async Task<IActionResult> PutEmpleado(string usuarioActual, EmpleadoUpdateDTO empleadoUpdate)
        {
           
            var empleadoExistente = await _context.Empleados
                .FirstOrDefaultAsync(e => e.Usuari!.ToLower() == usuarioActual.ToLower());

            if (empleadoExistente == null)
            {
                return NotFound("Empleado no encontrado.");
            }

       
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
            }
            catch (DbUpdateConcurrencyException)
            {
               
                return StatusCode(500, "Error de concurrencia al guardar los cambios del empleado.");
            }
            catch (Exception ex)
            {
              
                return StatusCode(500, $"Error interno del servidor: {ex.Message}");
            }

            return NoContent(); 
        }
        [HttpDelete("cliente/usuario")]
        public async Task<IActionResult> DeleteCliente([FromBody] Dictionary<string, string> body)
        {
            if (!body.TryGetValue("usuario", out string? usuario) || string.IsNullOrWhiteSpace(usuario))
            {
                return BadRequest("El nombre de usuario no puede estar vacío.");
            }

            var cliente = await _context.Clientes
                .FirstOrDefaultAsync(c => c.Usuari!.ToLower() == usuario.ToLower());

            if (cliente == null)
            {
                return NotFound("Cliente no encontrado.");
            }

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();

            return NoContent();
        }


        [HttpDelete("empleado/usuario")]
        public async Task<IActionResult> DeleteEmpleado([FromBody] Dictionary<string, string> body)
        {
            if (!body.TryGetValue("usuario", out string? usuario) || string.IsNullOrWhiteSpace(usuario))
            {
                return BadRequest("El nombre de usuario no puede estar vacío.");
            }

            var empleado = await _context.Empleados
                .FirstOrDefaultAsync(e => e.Usuari!.ToLower() == usuario.ToLower());

            if (empleado == null)
            {
                return NotFound("Empleado no encontrado.");
            }

            _context.Empleados.Remove(empleado);
            await _context.SaveChangesAsync();

            return NoContent();
        }









    }
}
