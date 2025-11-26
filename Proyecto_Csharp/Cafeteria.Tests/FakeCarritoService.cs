using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Cafeteria_back.Entities.Carritos;
using Microsoft.Extensions.Options;
using Cafeteria_back.Data;

public class FakeCarritoService : CarritoService
{
    private readonly Dictionary<string, Carrito> _carritos = new();
    private int _idCounter = 1;

    public FakeCarritoService() : base(
        Options.Create(new MongoDbSettings
        {
            ConnectionString = "mongodb://localhost",
            DatabaseName = "FakeDb",
            CarritosCollection = "Carritos"
        }))
    { }

    public override Task<Carrito?> ObtenerPorId(string id)
    {
        _carritos.TryGetValue(id, out var carrito);
        return Task.FromResult<Carrito?>(carrito);
    }

    public override Task<Carrito?> ObtenerPorCliente(long clienteId)
    {
        var carrito = _carritos.Values.FirstOrDefault(c => c.ClienteId == clienteId);
        return Task.FromResult<Carrito?>(carrito);
    }

    public override Task<Carrito?> ObtenerPorEmpleado(long Empleadoid)
    {
        var carrito = _carritos.Values.FirstOrDefault(c => c.EmpleadoId == Empleadoid);
        return Task.FromResult<Carrito?>(carrito);
    }

    public override Task Crear(Carrito carrito)
    {
        carrito.Id = (_idCounter++).ToString();
        _carritos[carrito.Id] = carrito;
        return Task.CompletedTask;
    }

    public override Task Actualizar(string id, Carrito carrito)
    {
        _carritos[id] = carrito;
        return Task.CompletedTask;
    }

    public override Task Eliminar(string id)
    {
        _carritos.Remove(id);
        return Task.CompletedTask;
    }
}
