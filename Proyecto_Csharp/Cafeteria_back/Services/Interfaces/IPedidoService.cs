namespace Cafeteria_back.Services.Interfaces
{
    public interface IPedidoService
    {
        Task<object?> ObtenerMisPedidosAsync(long clienteId);
        Task<object?> ConfirmarPedidoAsync(string carritoId, string tipoEntrega, string tipoPago);
        Task<object?> ObtenerMisVentasAsync(long clienteId);
        Task<object?> TodasLasVentasAsync();
        Task<object?> ObtenerTodosLosPedidosAsync();
        Task<object?> CambiarEstadoPedidoAsync(long pedidoId, string nuevoEstado, long? empleadoId);
        Task<object?> ObtenerInformacionCompletaDeTodosLosPedidosAsync();
    }
}
