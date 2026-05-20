using Cafeteria_back.Services.Interfaces;
using Cafeteria_back.Custom;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cafeteria_back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PedidoController : ControllerBase
    {
        private readonly IPedidoService _pedidoService;

        public PedidoController(IPedidoService pedidoService)
        {
            _pedidoService = pedidoService;
        }

        private long ObtenerClienteIdDesdeToken()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim == null || !long.TryParse(claim.Value, out var clienteId))
                throw new Exceptions.UnauthorizedException("No se pudo obtener el ID del cliente desde el token.");
            return clienteId;
        }

        [HttpGet("mis-pedidos")]
        public async Task<IActionResult> ObtenerMisPedidos()
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

            var resultado = await _pedidoService.ObtenerMisPedidosAsync(clienteId);

            if (resultado == null)
                return NotFound(ApiResponse<object>.ErrorResponse("No se encontraron pedidos para este cliente."));

            return Ok(ApiResponse<object>.SuccessResponse(resultado));
        }

        [HttpPost("confirmar")]
        public async Task<IActionResult> ConfirmarPedido(
            [FromQuery] string carritoId,
            [FromQuery] string tipoEntrega,
            [FromQuery] string Tipo_pago)
        {
            var resultado = await _pedidoService.ConfirmarPedidoAsync(carritoId, tipoEntrega, Tipo_pago);
            return Ok(ApiResponse<object>.SuccessResponse(resultado));
        }

        [HttpGet("mis-ventas")]
        public async Task<IActionResult> ObtenerMisVentas()
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

            var resultado = await _pedidoService.ObtenerMisVentasAsync(clienteId);

            if (resultado == null)
                return NotFound(ApiResponse<object>.ErrorResponse("No se encontraron ventas para este cliente."));

            return Ok(ApiResponse<object>.SuccessResponse(resultado));
        }

        [HttpGet("Todas-las-ventas")]
        public async Task<IActionResult> TodaslasVentas()
        {
            var resultado = await _pedidoService.TodasLasVentasAsync();

            if (resultado == null)
                return NotFound(ApiResponse<object>.ErrorResponse("No se encontraron ventas registradas."));

            return Ok(ApiResponse<object>.SuccessResponse(resultado));
        }

        [HttpGet("todos-pedidos")]
        public async Task<IActionResult> ObtenerTodosLosPedidos()
        {
            var resultado = await _pedidoService.ObtenerTodosLosPedidosAsync();
            return Ok(ApiResponse<object>.SuccessResponse(resultado));
        }

        [HttpPut("cambiar-estado/{pedidoId}")]
        public async Task<IActionResult> CambiarEstadoPedido(long pedidoId, [FromQuery] string nuevoEstado)
        {
            long? empleadoId = null;
            var empleadoIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (empleadoIdClaim != null && long.TryParse(empleadoIdClaim.Value, out long parsedId))
            {
                empleadoId = parsedId;
            }

            var resultado = await _pedidoService.CambiarEstadoPedidoAsync(pedidoId, nuevoEstado, empleadoId);
            return Ok(ApiResponse<object>.SuccessResponse(resultado));
        }

        [HttpGet("info-completa-todos")]
        public async Task<IActionResult> ObtenerInformacionCompletaDeTodosLosPedidos()
        {
            var resultado = await _pedidoService.ObtenerInformacionCompletaDeTodosLosPedidosAsync();

            if (resultado == null)
                return NotFound(ApiResponse<object>.ErrorResponse("No hay pedidos registrados."));

            return Ok(ApiResponse<object>.SuccessResponse(resultado));
        }
    }
}