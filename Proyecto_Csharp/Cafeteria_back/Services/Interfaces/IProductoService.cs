using Cafeteria_back.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Cafeteria_back.Services.Interfaces
{
    public interface IProductoService
    {
        Task<long> CrearProductoAsync(ProductoDTO dto);
        Task<IEnumerable<ProductoDTO_>> ObtenerProductosActivosAsync();
        Task<IEnumerable<ProductoDTO_>> ObtenerTodosProductosAsync();
        Task<ProductoDTO_?> ObtenerProductoPorIdAsync(long id);
        Task<bool> ActualizarProductoAsync(string nombre, ProductoDTO dto);
        Task<bool> EliminarProductoAsync(string nombre);
        Task<bool> CambiarEstadoProductoAsync(long id, bool nuevoEstado);
    }
}
