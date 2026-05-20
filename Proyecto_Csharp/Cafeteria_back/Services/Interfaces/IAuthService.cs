using Cafeteria_back.DTOs;
using Cafeteria_back.Entities.Usuarios;

namespace Cafeteria_back.Services.Interfaces
{
    public interface IAuthService
    {
        Task<bool> RegistrarClienteAsync(UsuarioPruebaDTO prueba);
        Task<bool> RegistrarEmpleadoAsync(EmpleadoDTO empleado);
        Task<(bool IsSuccess, string Message, string Token)> LoginAsync(LoginDTO objeto);
        Task<(bool IsSuccess, string Rol, string Token)> LoginEmpleadoAsync(LoginDTO objeto);
        Task<object?> ObtenerDatosUsuarioAsync(long id, string rol);
    }
}
