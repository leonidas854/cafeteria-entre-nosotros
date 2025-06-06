using Cafeteria_back.Data;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Cafeteria_back.Entities.Carritos
{
    public interface ICarritoService
    {
        Task<Carrito?> ObtenerPorId(string id);
        Task<Carrito?> ObtenerPorCliente(long clienteId);
        Task<Carrito?> ObtenerPorEmpleado(long empleadoId);
        Task Crear(Carrito carrito);
        Task Actualizar(string id, Carrito carrito);
        Task Eliminar(string id);
        Task AgregarProducto(long clienteId, ItemCarrito item);
        Task ModificarCantidad(long clienteId, long productoId, int nuevaCantidad);
        Task QuitarProducto(long clienteId, long productoId);
    }

    public class CarritoService : ICarritoService
    {
        protected readonly IMongoCollection<Carrito> _carritos;

        public CarritoService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _carritos = database.GetCollection<Carrito>(settings.Value.CarritosCollection);
        }

        public virtual async Task<Carrito?> ObtenerPorId(string id)
            => await _carritos.Find(c => c.Id == id).FirstOrDefaultAsync();

        public virtual async Task<Carrito?> ObtenerPorCliente(long clienteId)
            => await _carritos.Find(c => c.ClienteId == clienteId).FirstOrDefaultAsync();

        public virtual async Task<Carrito?> ObtenerPorEmpleado(long empleadoId)
            => await _carritos.Find(c => c.EmpleadoId == empleadoId).FirstOrDefaultAsync();

        public virtual async Task Crear(Carrito carrito)
            => await _carritos.InsertOneAsync(carrito);

        public virtual async Task Actualizar(string id, Carrito carrito)
            => await _carritos.ReplaceOneAsync(c => c.Id == id, carrito);

        public virtual async Task Eliminar(string id)
            => await _carritos.DeleteOneAsync(c => c.Id == id);

        public virtual async Task AgregarProducto(long clienteId, ItemCarrito item)
        {
            var carrito = await ObtenerPorCliente(clienteId);
            if (carrito == null)
            {
                carrito = new Carrito
                {
                    ClienteId = clienteId,
                    Items = new List<ItemCarrito> { item }
                };
                await Crear(carrito);
            }
            else
            {
                var existente = carrito.Items.FirstOrDefault(i => i.ProductoId == item.ProductoId);
                if (existente != null)
                    existente.Cantidad += item.Cantidad;
                else
                    carrito.Items.Add(item);
                await Actualizar(carrito.Id, carrito);
            }
        }

        public virtual async Task ModificarCantidad(long clienteId, long productoId, int nuevaCantidad)
        {
            var carrito = await ObtenerPorCliente(clienteId);
            if (carrito == null) return;
            var item = carrito.Items.FirstOrDefault(i => i.ProductoId == productoId);
            if (item != null)
            {
                item.Cantidad = nuevaCantidad;
                await Actualizar(carrito.Id, carrito);
            }
        }

        public virtual async Task QuitarProducto(long clienteId, long productoId)
        {
            var carrito = await ObtenerPorCliente(clienteId);
            if (carrito == null) return;
            carrito.Items.RemoveAll(i => i.ProductoId == productoId);
            await Actualizar(carrito.Id, carrito);
        }
    }
}
