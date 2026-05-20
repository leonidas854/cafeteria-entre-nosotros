using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Cafeteria_back.DTOs;
using Cafeteria_back.Services.Interfaces;
using Cafeteria_back.Custom;
using System.Security.Claims;

namespace Cafeteria_back.Controllers
{
    [Route("/[controller]")]
    [ApiController]
    public class AccesoController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly bool _segurity = false; // deberia venir de IConfiguration en un entorno real

        public AccesoController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost]
        [Route("Registrarse_Cliente")]
        [AllowAnonymous]
        public async Task<IActionResult> Registrarse(UsuarioPruebaDTO prueba)
        {
            var isSuccess = await _authService.RegistrarClienteAsync(prueba);
            
            return StatusCode(StatusCodes.Status200OK, ApiResponse<object>.SuccessResponse(
                new { isSuccess = isSuccess }
            ));
        }

        [HttpPost]
        [Route("Registrar_Empleado")]
        [AllowAnonymous]
        public async Task<IActionResult> Registrar_E(EmpleadoDTO empleado)
        {
            var isSuccess = await _authService.RegistrarEmpleadoAsync(empleado);
            
            return StatusCode(StatusCodes.Status200OK, ApiResponse<object>.SuccessResponse(
                new { isSuccess = isSuccess }
            ));
        }

        [HttpPost]
        [Route("Login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDTO objeto)
        {
            var (isSuccess, message, token) = await _authService.LoginAsync(objeto);

            if (!isSuccess)
            {
                return Ok(ApiResponse<object>.SuccessResponse(new { isSuccess = false, message = message, token = "" }));
            }

            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = _segurity,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(5)
            });

            return Ok(ApiResponse<object>.SuccessResponse(
                new { isSuccess = true, message = message }
            ));
        }

        [HttpPost]
        [Route("Logout")]
        [Authorize]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt");
            return Ok(ApiResponse<object>.SuccessResponse(
                new { isSuccess = true, message = "Sesión cerrada exitosamente" }
            ));
        }

        [HttpPost]
        [Route("Login_Empleado")]
        public async Task<IActionResult> Login_empleado(LoginDTO objeto)
        {
            var (isSuccess, rol, token) = await _authService.LoginEmpleadoAsync(objeto);

            if (!isSuccess)
            {
                return StatusCode(StatusCodes.Status200OK, ApiResponse<object>.SuccessResponse(new { isSuccess = false, token = "" }));
            }

            Response.Cookies.Append("jwt", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = _segurity,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(5)
            });
            
            return StatusCode(StatusCodes.Status200OK, ApiResponse<object>.SuccessResponse(new
            {
                isSuccess = true,
                Rol = rol
            }));
        }

        private long ObtenerClienteIdDesdeToken()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim == null || !long.TryParse(claim.Value, out var clienteId))
                throw new Exceptions.UnauthorizedException("No se pudo obtener el ID del cliente desde el token.");
            return clienteId;
        }

        [HttpGet]
        [Route("Datos")]
        [Authorize]
        public async Task<IActionResult> ObtenerMisDatos()
        {
            long clienteId;
            string? rol;

            try
            {
                clienteId = ObtenerClienteIdDesdeToken();
                rol = User.FindFirst(ClaimTypes.Role)?.Value;
            }
            catch
            {
                throw new Exceptions.UnauthorizedException("Token inválido o faltan claims.");
            }

            if (string.IsNullOrEmpty(rol))
                throw new Exceptions.UnauthorizedException("Rol no reconocido.");

            var datosUsuario = await _authService.ObtenerDatosUsuarioAsync(clienteId, rol);

            if (datosUsuario == null)
                throw new Exceptions.NotFoundException("Cliente o empleado no encontrado.");

            return Ok(ApiResponse<object>.SuccessResponse(datosUsuario));
        }
    }
}
