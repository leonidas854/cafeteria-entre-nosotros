using Cafeteria_back.Entities.Carritos;

namespace Cafeteria_back.Services.Interfaces
{
    public interface ICarritoService
    {
        Task<Carrito?> ObtenerCarritoParaUsuarioAsync(long usuarioId, string rol);
        Task<Carrito> AgregarItemAsync(long usuarioId, string rol, ItemCarrito itemNuevo, long? clienteIdParaEmpleado = null);
        Task<Carrito?> ModificarCantidadItemAsync(long usuarioId, string rol, ModificarCantidadDto dto);
        Task<Carrito?> ModificarExtrasItemAsync(long usuarioId, string rol, ModificarExtrasDto dto);
        Task<Carrito?> QuitarItemAsync(long usuarioId, string rol, QuitarProductoDto dto);
        Task<Carrito?> AsignarCarritoAClienteAsync(string carritoId, long clienteId);
        Task EliminarCarritoCompletoAsync(string id);

        // Métodos de compatibilidad temporal para otros controladores sin refactorizar
        Task<Carrito?> ObtenerPorId(string id);
        Task<Carrito?> ObtenerPorCliente(long clienteId);
        Task Eliminar(string id);
        Task Crear(Carrito carrito);
        Task<Carrito> Crear_(Carrito carrito);
    }
}
