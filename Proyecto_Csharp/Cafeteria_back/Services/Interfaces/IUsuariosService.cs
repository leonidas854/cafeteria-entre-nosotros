using Cafeteria_back.DTOs;

namespace Cafeteria_back.Services.Interfaces
{
    public interface IUsuariosService
    {
        Task<IEnumerable<UsuarioPruebaDTO>> GetClientesAsync();
        Task<IEnumerable<EmpleadoDTO>> GetEmpleadosAsync();
        Task<bool> ActualizarClienteAsync(string usuarioActual, UsuarioPruebaDTO cliente);
        Task<bool> ActualizarEmpleadoAsync(string usuarioActual, EmpleadoUpdateDTO empleadoUpdate);
        Task<bool> EliminarClienteAsync(string usuario);
        Task<bool> EliminarEmpleadoAsync(string usuario);
    }
}
