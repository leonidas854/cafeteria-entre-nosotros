using Cafeteria_back.DTOs;
using Cafeteria_back.Entities.Promociones;

namespace Cafeteria_back.Services.Interfaces
{
    public interface IPromocionesService
    {
        Task<object?> CrearPromocionAsync(PromocionDTO dto);
        Task<IEnumerable<PromocionDTO>> ObtenerPromocionesAsync();
        Task<IEnumerable<PromocionTodoDTO>> ObtenerTodasLasPromocionesAsync();
        Task<object?> EditarPromocionAsync(string strategykey, PromocionDTO dto);
        Task<bool> EliminarPromocionAsync(string strategykey);
    }
}
