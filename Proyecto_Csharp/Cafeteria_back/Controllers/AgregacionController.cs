using Cafeteria_back.Custom;
using Cafeteria_back.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cafeteria_back.Exceptions;

namespace Cafeteria_back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AgregacionController : ControllerBase
    {
        private readonly IAgregacionService _agregacionService;

        public AgregacionController(IAgregacionService agregacionService)
        {
            _agregacionService = agregacionService;
        }

        [HttpGet("Producto/Categorias")]
        public async Task<IActionResult> GetCategorias()
        {
            var resultado = await _agregacionService.GetCategoriasAsync();
            return Ok(ApiResponse<IEnumerable<string>>.SuccessResponse(resultado));
        }

        [HttpGet("Producto/Subcategorias")]
        public async Task<IActionResult> GetSubcategorias([FromQuery] string categoria)
        {
            var resultado = await _agregacionService.GetSubcategoriasAsync(categoria);
            return Ok(ApiResponse<IEnumerable<string>>.SuccessResponse(resultado));
        }

        [HttpGet("Producto/Sabores")]
        public async Task<IActionResult> GetSabores()
        {
            var resultado = await _agregacionService.GetSaboresAsync();
            return Ok(ApiResponse<object>.SuccessResponse(resultado));
        }

        [HttpGet("Empleado/Roles")]
        public async Task<IActionResult> GetRoles()
        {
            var resultado = await _agregacionService.GetRolesAsync();
            return Ok(ApiResponse<IEnumerable<string>>.SuccessResponse(resultado));
        }

        [HttpGet("Producto/Productos")]
        public async Task<IActionResult> GetProductos()
        {
            var resultado = await _agregacionService.GetProductosAsync();
            return Ok(ApiResponse<object>.SuccessResponse(resultado));
        }

        [HttpPost("Confirmar")]
        public async Task<IActionResult> Confirmar([FromBody] string contra)
        {
            long clienteId;
            try
            {
                clienteId = ObtenerClienteIdDesdeToken();
            }
            catch
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Token inválido o faltan claims."));
            }

            var usuarioEncontrado = await _agregacionService.ConfirmarAsync(contra, clienteId);

            if (usuarioEncontrado == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Usuario no encontrado"));

            return Ok(ApiResponse<string>.SuccessResponse(usuarioEncontrado));
        }

        private long ObtenerClienteIdDesdeToken()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim == null || !long.TryParse(claim.Value, out var clienteId))
                throw new UnauthorizedException("No se pudo obtener el ID del cliente desde el token.");
            return clienteId;
        }
    }
}
