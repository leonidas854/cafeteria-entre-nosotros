using Microsoft.AspNetCore.Mvc;
using Cafeteria_back.DTOs;
using Cafeteria_back.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Cafeteria_back.Custom;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class ExtrasController : ControllerBase
    {
        private readonly IExtrasService _extrasService;

        public ExtrasController(IExtrasService extrasService)
        {
            _extrasService = extrasService;
        }

        [HttpGet]
        public async Task<IActionResult> GetExtras()
        {
            var extras = await _extrasService.GetExtrasAsync();
            return Ok(ApiResponse<IEnumerable<ExtraDTO>>.SuccessResponse(extras));
        }

        [HttpGet("nombre/{Nombre}")]
        public async Task<IActionResult> GetExtra(string Nombre)
        {
            var extra = await _extrasService.GetExtraPorNombreAsync(Nombre);
            if (extra == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Extra no encontrado."));

            return Ok(ApiResponse<ExtraDTO>.SuccessResponse(extra));
        }

        [HttpPut("Nombre/{Nombre}")]
        public async Task<IActionResult> PutExtra(string Nombre, ExtraDTO extra)
        {
            await _extrasService.ActualizarExtraAsync(Nombre, extra);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Extra actualizado correctamente."));
        }

        [HttpPost]
        public async Task<IActionResult> PostExtra(ExtraDTO extra)
        {
            await _extrasService.CrearExtraAsync(extra);
            return Ok(ApiResponse<object>.SuccessResponse(new { isSuccess = true }, "Extra creado correctamente."));
        }

        [HttpDelete("Nombre/{Nombre}")]
        public async Task<IActionResult> DeleteExtra(string Nombre)
        {
            await _extrasService.EliminarExtraAsync(Nombre);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Extra eliminado correctamente."));
        }
    }
}
