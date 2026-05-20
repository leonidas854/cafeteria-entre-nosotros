using Cafeteria_back.Custom;
using Cafeteria_back.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HomeController : ControllerBase
    {
        private readonly IHomeService _homeService;

        public HomeController(IHomeService homeService)
        {
            _homeService = homeService;
        }

        [HttpPost("agregar_varios")]
        public async Task<IActionResult> AgregarVarios(int repeticiones)
        {
            var resultado = await _homeService.AgregarVariosAsync(repeticiones);
            return Ok(ApiResponse<string>.SuccessResponse(resultado));
        }
    }
}
