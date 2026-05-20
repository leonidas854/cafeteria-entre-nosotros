using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Cafeteria_back.DTOs;
using Cafeteria_back.Services.Interfaces;
using Cafeteria_back.Custom;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    //[Authorize]
    [ApiController]
    public class ProductoController : ControllerBase
    {
        private readonly IProductoService _productoService;

        public ProductoController(IProductoService productoService)
        {
            _productoService = productoService;
        }

        [HttpPost]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CrearProducto([FromForm] ProductoDTO dto)
        {
            var id = await _productoService.CrearProductoAsync(dto);
            return Ok(ApiResponse<object>.SuccessResponse(new { isSuccess = true, id = id }));
        }

        [HttpGet]
        public async Task<IActionResult> ObtenerProductos()
        {
            var resultado = await _productoService.ObtenerProductosActivosAsync();
            return Ok(ApiResponse<IEnumerable<ProductoDTO_>>.SuccessResponse(resultado));
        }

        [HttpPut("nombre/{nombre}")]
        [Consumes("multipart/form-data")]
        [Authorize]
        public async Task<IActionResult> ActualizarProducto(string nombre, [FromForm] ProductoDTO dto)
        {
            await _productoService.ActualizarProductoAsync(nombre, dto);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Producto actualizado exitosamente."));
        }

        [HttpDelete("nombre/{nombre}")]
        [Authorize]
        public async Task<IActionResult> EliminarProducto(string nombre)
        {
            await _productoService.EliminarProductoAsync(nombre);
            return Ok(ApiResponse<object>.SuccessResponse(null, "Producto eliminado exitosamente."));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObtenerProductoPorId(long id)
        {
            var producto = await _productoService.ObtenerProductoPorIdAsync(id);
            if (producto == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Producto no encontrado."));

            return Ok(ApiResponse<ProductoDTO_>.SuccessResponse(producto));
        }

        [HttpGet("TodosProductos")]
        public async Task<IActionResult> ObtenerTodosProductos()
        {
            var resultado = await _productoService.ObtenerTodosProductosAsync();
            return Ok(ApiResponse<IEnumerable<ProductoDTO_>>.SuccessResponse(resultado));
        }

        [HttpPatch("estado/{id}")]
        [Authorize]
        public async Task<IActionResult> CambiarEstadoProducto(long id, [FromBody] bool nuevoEstado)
        {
            await _productoService.CambiarEstadoProductoAsync(id, nuevoEstado);
            return Ok(ApiResponse<object>.SuccessResponse(new
            {
                mensaje = "Estado del producto actualizado correctamente.",
                nuevoEstado = nuevoEstado
            }));
        }
    }
}
