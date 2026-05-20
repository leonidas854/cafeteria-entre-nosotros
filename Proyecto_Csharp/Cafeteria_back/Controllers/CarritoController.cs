using Cafeteria_back.Entities.Carritos;
using Cafeteria_back.Services.Interfaces;
using Cafeteria_back.Custom;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Cafeteria_back.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CarritoController : ControllerBase
    {
        private readonly ICarritoService _carritoService;
        private readonly ICurrentUserService _currentUserService;

        public CarritoController(ICarritoService carritoService, ICurrentUserService currentUserService)
        {
            _carritoService = carritoService;
            _currentUserService = currentUserService;
        }

        [HttpGet]
        public async Task<IActionResult> Obtener()
        {
            var usuarioId = _currentUserService.GetUserId();
            var rol = _currentUserService.GetUserRole();

            var carrito = await _carritoService.ObtenerCarritoParaUsuarioAsync(usuarioId, rol);

            if (carrito == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Carrito no encontrado."));

            return Ok(ApiResponse<Carrito>.SuccessResponse(carrito));
        }

        [HttpPost("agregar")]
        public async Task<IActionResult> Agregar([FromBody] Carrito carritoReq)
        {
            var usuarioId = _currentUserService.GetUserId();
            var rol = _currentUserService.GetUserRole();

            if (carritoReq.Items == null || !carritoReq.Items.Any())
                return BadRequest(ApiResponse<object>.ErrorResponse("El carrito debe contener al menos un ítem."));

            Carrito? carritoActualizado = null;
            foreach (var item in carritoReq.Items)
            {
                carritoActualizado = await _carritoService.AgregarItemAsync(usuarioId, rol, item, carritoReq.ClienteId);
            }

            return Ok(ApiResponse<Carrito>.SuccessResponse(carritoActualizado!));
        }

        [HttpPut("modificar-cantidad")]
        public async Task<IActionResult> ModificarCantidad([FromBody] ModificarCantidadDto dto)
        {
            var usuarioId = _currentUserService.GetUserId();
            var rol = _currentUserService.GetUserRole();

            var carrito = await _carritoService.ModificarCantidadItemAsync(usuarioId, rol, dto);

            if (carrito == null) 
                return NotFound(ApiResponse<object>.ErrorResponse("Ítem no encontrado en el carrito."));

            return Ok(ApiResponse<Carrito>.SuccessResponse(carrito));
        }

        [HttpPut("modificar-extras")]
        public async Task<IActionResult> ModificarExtras([FromBody] ModificarExtrasDto dto)
        {
            var usuarioId = _currentUserService.GetUserId();
            var rol = _currentUserService.GetUserRole();

            var carrito = await _carritoService.ModificarExtrasItemAsync(usuarioId, rol, dto);

            if (carrito == null) 
                return NotFound(ApiResponse<object>.ErrorResponse("Producto no encontrado en el carrito."));

            return Ok(ApiResponse<Carrito>.SuccessResponse(carrito));
        }

        [HttpDelete("quitar-producto")]
        public async Task<IActionResult> QuitarProducto([FromBody] QuitarProductoDto dto)
        {
            var usuarioId = _currentUserService.GetUserId();
            var rol = _currentUserService.GetUserRole();

            var carrito = await _carritoService.QuitarItemAsync(usuarioId, rol, dto);

            if (carrito == null) 
                return NotFound(ApiResponse<object>.ErrorResponse("Carrito o producto no encontrado."));

            return Ok(ApiResponse<Carrito>.SuccessResponse(carrito));
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Eliminar(string id)
        {
            await _carritoService.EliminarCarritoCompletoAsync(id);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Carrito eliminado exitosamente."));
        }

        [HttpPut("asignar-a-cliente/{carritoId}")]
        public async Task<IActionResult> AsignarCarritoACliente(string carritoId, [FromQuery] long clienteId)
        {
            var carrito = await _carritoService.AsignarCarritoAClienteAsync(carritoId, clienteId);

            if (carrito == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Carrito no encontrado."));

            return Ok(ApiResponse<Carrito>.SuccessResponse(carrito));
        }
    }
}
