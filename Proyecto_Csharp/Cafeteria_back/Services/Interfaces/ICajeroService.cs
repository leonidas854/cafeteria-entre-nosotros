using Cafeteria_back.DTOs;

namespace Cafeteria_back.Services.Interfaces
{
    public interface ICajeroService
    {
        Task<UsuarioNit?> BuscarClientePorNITAsync(int nit);
        Task<object?> ActualizarApellidoPorNITAsync(int nit, string nuevoApellido);
        Task<object?> RegistrarseAsync(UsuarioNit prueba);
    }
}
