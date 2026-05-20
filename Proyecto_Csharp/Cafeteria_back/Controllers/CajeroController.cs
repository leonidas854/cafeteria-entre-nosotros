using Cafeteria_back.Custom;
using Cafeteria_back.DTOs;
using Cafeteria_back.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cafeteria_back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CajeroController : ControllerBase
    {
        private readonly ICajeroService _cajeroService;

        public CajeroController(ICajeroService cajeroService)
        {
            _cajeroService = cajeroService;
        }

        [HttpGet("nit/{nit}")]
        public async Task<IActionResult> BuscarClientePorNIT(int nit)
        {
            var cliente = await _cajeroService.BuscarClientePorNITAsync(nit);

            if (cliente == null)
            {
                return NotFound(ApiResponse<object>.ErrorResponse("Cliente no encontrado con ese NIT."));
            }

            return Ok(ApiResponse<UsuarioNit>.SuccessResponse(cliente));
        }

        [HttpPut("actualizar-apellido/{nit}")]
        public async Task<IActionResult> ActualizarApellidoPorNIT(int nit, [FromBody] string nuevoApellido)
        {
            var clienteInfo = await _cajeroService.ActualizarApellidoPorNITAsync(nit, nuevoApellido);

            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                mensaje = "Apellido actualizado correctamente.",
                cliente = clienteInfo
            }));
        }

        [HttpPost]
        [Route("Registrar")]
        public async Task<IActionResult> Registrarse(UsuarioNit prueba)
        {
            var clienteDto = await _cajeroService.RegistrarseAsync(prueba);

            if (clienteDto != null)
            {
                return Ok(ApiResponse<object>.SuccessResponse(new
                {
                    isSuccess = true,
                    cliente = clienteDto
                }));
            }
            else
            {
                return Ok(ApiResponse<object>.SuccessResponse(new { isSuccess = false }));
            }
        }
    }
}
