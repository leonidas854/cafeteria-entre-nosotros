namespace Cafeteria_back.Services.Interfaces
{
    public interface IAgregacionService
    {
        Task<IEnumerable<string>> GetCategoriasAsync();
        Task<IEnumerable<string>> GetSubcategoriasAsync(string categoria);
        Task<object> GetSaboresAsync();
        Task<IEnumerable<string>> GetRolesAsync();
        Task<object> GetProductosAsync();
        Task<string?> ConfirmarAsync(string contra, long clienteId);
    }
}
