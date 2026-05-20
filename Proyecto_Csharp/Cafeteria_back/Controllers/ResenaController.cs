using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Cafeteria_back.Custom;
using Cafeteria_back.DTOs;
using Cafeteria_back.Services.Interfaces;
using Cafeteria_back.Exceptions;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResenaController : ControllerBase
    {
        private readonly IResenaService _resenaService;

        public ResenaController(IResenaService resenaService)
        {
            _resenaService = resenaService;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Resena(resenaDTO resen)
        {
            long usuarioId;
            try
            {
                usuarioId = ObtenerClienteIdDesdeToken();
            }
            catch
            {
                return Unauthorized(ApiResponse<object>.ErrorResponse("Token inválido o faltan claims."));
            }

            await _resenaService.CrearResenaAsync(resen, usuarioId);

            return Ok(ApiResponse<object>.SuccessResponse(new { isSuccess = true }, "Reseña creada correctamente."));
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