using Cafeteria_back.DTOs;

namespace Cafeteria_back.Services.Interfaces
{
    public interface IResenaService
    {
        Task<bool> CrearResenaAsync(resenaDTO resen, long usuarioId);
    }
}
