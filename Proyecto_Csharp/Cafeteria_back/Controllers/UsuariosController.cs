using Cafeteria_back.Custom;
using Cafeteria_back.DTOs;
using Cafeteria_back.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class UsuariosController : ControllerBase
    {
        private readonly IUsuariosService _usuariosService;

        public UsuariosController(IUsuariosService usuariosService)
        {
            _usuariosService = usuariosService;
        }

        [HttpGet("Clientes")]
        public async Task<IActionResult> GetClientes()
        {
            var clientes = await _usuariosService.GetClientesAsync();
            return Ok(ApiResponse<IEnumerable<UsuarioPruebaDTO>>.SuccessResponse(clientes));
        }

        [HttpGet("Empleados")]
        public async Task<IActionResult> GetEmpleado()
        {
            var empleados = await _usuariosService.GetEmpleadosAsync();
            return Ok(ApiResponse<IEnumerable<EmpleadoDTO>>.SuccessResponse(empleados));
        }

        [HttpPut("cliente/usuario/{usuarioActual}")]
        public async Task<IActionResult> PutCliente(string usuarioActual, UsuarioPruebaDTO cliente)
        {
            await _usuariosService.ActualizarClienteAsync(usuarioActual, cliente);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Cliente actualizado exitosamente."));
        }

        [HttpPut("empleado/usuario/{usuarioActual}")]
        public async Task<IActionResult> PutEmpleado(string usuarioActual, EmpleadoUpdateDTO empleadoUpdate)
        {
            await _usuariosService.ActualizarEmpleadoAsync(usuarioActual, empleadoUpdate);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Empleado actualizado exitosamente."));
        }

        [HttpDelete("cliente/usuario")]
        public async Task<IActionResult> DeleteCliente([FromBody] Dictionary<string, string> body)
        {
            if (!body.TryGetValue("usuario", out string? usuario) || string.IsNullOrWhiteSpace(usuario))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("El nombre de usuario no puede estar vacío."));
            }

            await _usuariosService.EliminarClienteAsync(usuario);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Cliente eliminado exitosamente."));
        }

        [HttpDelete("empleado/usuario")]
        public async Task<IActionResult> DeleteEmpleado([FromBody] Dictionary<string, string> body)
        {
            if (!body.TryGetValue("usuario", out string? usuario) || string.IsNullOrWhiteSpace(usuario))
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("El nombre de usuario no puede estar vacío."));
            }

            await _usuariosService.EliminarEmpleadoAsync(usuario);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Empleado eliminado exitosamente."));
        }
    }
}
