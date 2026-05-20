using Cafeteria_back.DTOs;
using Cafeteria_back.Entities.Extras;

namespace Cafeteria_back.Services.Interfaces
{
    public interface IExtrasService
    {
        Task<IEnumerable<ExtraDTO>> GetExtrasAsync();
        Task<ExtraDTO?> GetExtraPorNombreAsync(string nombre);
        Task<bool> ActualizarExtraAsync(string nombre, ExtraDTO extraDto);
        Task<bool> CrearExtraAsync(ExtraDTO extraDto);
        Task<bool> EliminarExtraAsync(string nombre);
    }
}
