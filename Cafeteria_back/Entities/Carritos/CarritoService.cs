using Cafeteria_back.Data;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Cafeteria_back.Entities.Carritos
{
    public class CarritoService
    {
        private readonly IMongoCollection<Carrito> _carritos;

        public CarritoService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _carritos = database.GetCollection<Carrito>(settings.Value.CarritosCollection);
        }

        // Obtener carrito por ID (para confirmar)
        public async Task<Carrito?> ObtenerPorId(string id)
        {
            return await _carritos.Find(c => c.Id == id).FirstOrDefaultAsync();
        }

        // Obtener carrito de un cliente
        public async Task<Carrito?> ObtenerPorCliente(long clienteId)
        {
            return await _carritos.Find(c => c.ClienteId == clienteId).FirstOrDefaultAsync();
        }
        // Obtener carrito de un cliente
        public async Task<Carrito?> ObtenerPorEmpleado(long Empleadoid)
        {
            return await _carritos.Find(c => c.EmpleadoId == Empleadoid).FirstOrDefaultAsync();
        }

        // Crear nuevo carrito
        public async Task Crear(Carrito carrito)
        {
            await _carritos.InsertOneAsync(carrito);
        }

        // Actualizar carrito completo (reemplaza)
        public async Task Actualizar(string id, Carrito carrito)
        {
            await _carritos.ReplaceOneAsync(c => c.Id == id, carrito);
        }

        // Eliminar carrito (tras confirmar pedido)
        public async Task Eliminar(string id)
        {
            await _carritos.DeleteOneAsync(c => c.Id == id);
        }

        // Agregar producto al carrito (versión servicio)
        public async Task AgregarProducto(long clienteId, ItemCarrito item)
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
                {
                    existente.Cantidad += item.Cantidad;
                }
                else
                {
                    carrito.Items.Add(item);
                }

                await Actualizar(carrito.Id, carrito);
            }
        }

        // Modificar cantidad de un producto
        public async Task ModificarCantidad(long clienteId, long productoId, int nuevaCantidad)
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

        // Quitar producto
        public async Task QuitarProducto(long clienteId, long productoId)
        {
            var carrito = await ObtenerPorCliente(clienteId);
            if (carrito == null) return;

            carrito.Items.RemoveAll(i => i.ProductoId == productoId);
            await Actualizar(carrito.Id, carrito);
        }
    }
}
