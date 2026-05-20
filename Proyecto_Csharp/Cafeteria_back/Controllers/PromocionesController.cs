using Cafeteria_back.Custom;
using Cafeteria_back.DTOs;
using Cafeteria_back.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromocionesController : ControllerBase
    {
        private readonly IPromocionesService _promocionesService;

        public PromocionesController(IPromocionesService promocionesService)
        {
            _promocionesService = promocionesService;
        }

        [HttpPost]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CrearPromocion([FromForm] PromocionDTO dto)
        {
            var resultado = await _promocionesService.CrearPromocionAsync(dto);
            return Ok(ApiResponse<object>.SuccessResponse(new { isSuccess = true, data = resultado }));
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerPromociones()
        {
            var resultado = await _promocionesService.ObtenerPromocionesAsync();
            return Ok(ApiResponse<IEnumerable<PromocionDTO>>.SuccessResponse(resultado));
        }

        [HttpGet("todas")]
        public async Task<IActionResult> ObtenerTodasLasPromociones()
        {
            var resultado = await _promocionesService.ObtenerTodasLasPromocionesAsync();
            return Ok(ApiResponse<IEnumerable<PromocionTodoDTO>>.SuccessResponse(resultado));
        }

        [HttpPut("{strategykey}")]
        [Authorize]
        [Consumes("application/json")]
        public async Task<IActionResult> EditarPromocion(string strategykey, [FromBody] PromocionDTO dto)
        {
            var resultado = await _promocionesService.EditarPromocionAsync(strategykey, dto);
            return Ok(ApiResponse<object>.SuccessResponse(new { isSuccess = true, data = resultado }));
        }

        [HttpDelete("{strategykey}")]
        [Authorize]
        public async Task<IActionResult> EliminarPromocion(string strategykey)
        {
            await _promocionesService.EliminarPromocionAsync(strategykey);
            return Ok(ApiResponse<object>.SuccessResponse(new { isSuccess = true }, "Promoción eliminada correctamente."));
        }
    }
}
