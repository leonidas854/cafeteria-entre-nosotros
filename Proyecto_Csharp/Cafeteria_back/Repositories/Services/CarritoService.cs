using Cafeteria_back.Data;
using Cafeteria_back.Entities.Carritos;
using Cafeteria_back.Repositorio;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace Cafeteria_back.Repositories.Services
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
    }

    public class CarritoService : ICarritoService
    {
        private readonly IMongoCollection<Carrito> _carritos;
        private readonly MiDbContext _miDbContext; // Para consultar promociones en SQL

        public CarritoService(IOptions<MongoDbSettings> settings, MiDbContext miDbContext)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DatabaseName);
            _carritos = database.GetCollection<Carrito>(settings.Value.CarritosCollection);
            _miDbContext = miDbContext;
        }

        public async Task<Carrito?> ObtenerCarritoParaUsuarioAsync(long usuarioId, string rol)
        {
            var carrito = await ObtenerCarritoDbAsync(usuarioId, rol);
            if (carrito == null) return null;

            await ActualizarEstadoPromocionesCarritoAsync(carrito);
            // Guardamos el carrito por si las promociones han cambiado su estado.
            await _carritos.ReplaceOneAsync(c => c.Id == carrito.Id, carrito);

            return carrito;
        }

        public async Task<Carrito> AgregarItemAsync(long usuarioId, string rol, ItemCarrito itemNuevo, long? clienteIdParaEmpleado = null)
        {
            var carrito = await ObtenerOCrearCarritoAsync(usuarioId, rol, clienteIdParaEmpleado);

        
            var itemExistente = carrito.Items.FirstOrDefault(i =>
                i.ProductoId == itemNuevo.ProductoId &&
                i.Extras.Select(e => e.ExtraId).OrderBy(id => id)
                    .SequenceEqual(itemNuevo.Extras.Select(e => e.ExtraId).OrderBy(id => id))
            );

            if (itemExistente != null && !itemExistente.TienePromocion) 
            {
                itemExistente.Cantidad += itemNuevo.Cantidad;
            }
            else
            {
                
                carrito.Items.Add(itemNuevo);
            }

            await ActualizarEstadoPromocionesCarritoAsync(carrito);
            await _carritos.ReplaceOneAsync(c => c.Id == carrito.Id, carrito);
            return carrito;
        }

        public async Task<Carrito?> ModificarCantidadItemAsync(long usuarioId, string rol, ModificarCantidadDto dto)
        {
            var carrito = await ObtenerCarritoDbAsync(usuarioId, rol);
            if (carrito == null) return null;

            var item = carrito.Items.FirstOrDefault(i => i.ProductoId == dto.ProductoId);
            if (item == null) return null; 

            if (dto.NuevaCantidad > 0)
            {
                item.Cantidad = dto.NuevaCantidad;
            }
            else
            {
                carrito.Items.Remove(item);
            }

            await ActualizarEstadoPromocionesCarritoAsync(carrito);
            await _carritos.ReplaceOneAsync(c => c.Id == carrito.Id, carrito);
            return carrito;
        }

        public async Task<Carrito?> ModificarExtrasItemAsync(long usuarioId, string rol, ModificarExtrasDto dto)
        {
            var carrito = await ObtenerCarritoDbAsync(usuarioId, rol);
            if (carrito == null) return null;

            var item = carrito.Items.FirstOrDefault(i => i.ProductoId == dto.ProductoId);
            if (item == null) return null;

            item.Extras = dto.NuevosExtras;

           
            await ActualizarEstadoPromocionesCarritoAsync(carrito);
            await _carritos.ReplaceOneAsync(c => c.Id == carrito.Id, carrito);
            return carrito;
        }


        public async Task<Carrito?> QuitarItemAsync(long usuarioId, string rol, QuitarProductoDto dto)
        {
            var carrito = await ObtenerCarritoDbAsync(usuarioId, rol);
            if (carrito == null) return null;

            var itemsEliminados = carrito.Items.RemoveAll(i => i.ProductoId == dto.ProductoId);
            if (itemsEliminados == 0) return carrito; 

            await ActualizarEstadoPromocionesCarritoAsync(carrito);
            await _carritos.ReplaceOneAsync(c => c.Id == carrito.Id, carrito);
            return carrito;
        }

        public async Task<Carrito?> AsignarCarritoAClienteAsync(string carritoId, long clienteId)
        {
            var carrito = await _carritos.Find(c => c.Id == carritoId).FirstOrDefaultAsync();
            if (carrito == null) return null;

           

            carrito.ClienteId = clienteId;
            carrito.EmpleadoId = null; 

            await _carritos.ReplaceOneAsync(c => c.Id == carritoId, carrito);
            return carrito;
        }

        public async Task EliminarCarritoCompletoAsync(string id)
        {
            await _carritos.DeleteOneAsync(c => c.Id == id);
        }

        #region Métodos Privados y Lógica de Promociones

        private async Task<Carrito?> ObtenerCarritoDbAsync(long usuarioId, string rol)
        {
            var filter = rol switch
            {
                "Cliente" => Builders<Carrito>.Filter.Eq(c => c.ClienteId, usuarioId),
                "Empleado" => Builders<Carrito>.Filter.Eq(c => c.EmpleadoId, usuarioId),
                _ => throw new UnauthorizedAccessException("Rol no reconocido."),
            };
            return await _carritos.Find(filter).FirstOrDefaultAsync();
        }

        private async Task<Carrito> ObtenerOCrearCarritoAsync(long usuarioId, string rol, long? clienteIdParaEmpleado)
        {
            var carrito = await ObtenerCarritoDbAsync(usuarioId, rol);
            if (carrito == null)
            {
                carrito = new Carrito { Items = new List<ItemCarrito>() };
                if (rol == "Cliente")
                {
                    carrito.ClienteId = usuarioId;
                }
                else if (rol == "Empleado")
                {
                    carrito.EmpleadoId = usuarioId;
                    carrito.ClienteId = clienteIdParaEmpleado;
                }
                await _carritos.InsertOneAsync(carrito);
            }
            return carrito;
        }

       
        private async Task ActualizarEstadoPromocionesCarritoAsync(Carrito carrito)
        {
            // 1. Fusionar items idénticos y resetear promociones
            FusionarItemsIdenticosYResetearPromos(carrito);

            var promocionesVigentes = await _miDbContext.Promociones
                .Include(p => p.Producto_promocion) 
                .Where(p => p.Fech_ini <= DateTime.UtcNow && p.Fecha_final >= DateTime.UtcNow)
                .ToListAsync();

            foreach (var promocion in promocionesVigentes)
            {
                var productosRequeridos = promocion.Producto_promocion!.Select(pp => pp.Producto_id).ToList();
                if (!productosRequeridos.Any()) continue;

                while (true)
                {
                    var itemsCandidatos = new List<ItemCarrito>();
                    bool sePuedeAplicar = true;

                    foreach (var prodIdRequerido in productosRequeridos)
                    {
                        var itemDisponible = carrito.Items.FirstOrDefault(item =>
                            item.ProductoId == prodIdRequerido && !item.TienePromocion);

                        if (itemDisponible == null)
                        {
                            sePuedeAplicar = false;
                            break;
                        }
                        itemsCandidatos.Add(itemDisponible);
                    }

                    if (sePuedeAplicar)
                    {
                       
                        foreach (var itemParaPromo in itemsCandidatos)
                        {
                            if (itemParaPromo.Cantidad > 1)
                            {
                               
                                itemParaPromo.Cantidad--;

                               
                                var itemConPromocion = new ItemCarrito
                                {
                                   
                                    ProductoId = itemParaPromo.ProductoId,
                                    Nombre = itemParaPromo.Nombre,
                                    Categoria = itemParaPromo.Categoria,
                                    Cantidad = 1,
                                    PrecioUnitario = itemParaPromo.PrecioUnitario,
                                    Extras = itemParaPromo.Extras,
                                    TienePromocion = true,
                                    PrecioPromocional = itemParaPromo.PrecioUnitario * (1 - (promocion.Descuento / 100f)),
                                    DescripcionPromocion = promocion.Strategykey
                                };
                                carrito.Items.Add(itemConPromocion);
                            }
                            else 
                            {
                                itemParaPromo.TienePromocion = true;
                                itemParaPromo.PrecioPromocional = itemParaPromo.PrecioUnitario * (1 - (promocion.Descuento / 100f));
                                itemParaPromo.DescripcionPromocion = promocion.Strategykey;
                            }
                        }
                    }
                    else
                    {
                        break; 
                    }
                }
            }
        }

        private void FusionarItemsIdenticosYResetearPromos(Carrito carrito)
        {
            var itemsSinPromo = new List<ItemCarrito>();
            var itemsConPromo = new List<ItemCarrito>();

            
            foreach (var item in carrito.Items)
            {
                if (item.TienePromocion)
                {
                    itemsConPromo.Add(item);
                }
                else
                {
                    item.TienePromocion = false;
                    item.PrecioPromocional = null;
                    item.DescripcionPromocion = null;
                    itemsSinPromo.Add(item);
                }
            }

            var itemsFusionados = itemsSinPromo
                .GroupBy(i => new {
                    i.ProductoId,
                    ExtrasKey = string.Join(",", i.Extras.Select(e => e.ExtraId).OrderBy(id => id))
                })
                .Select(g => {
                    var itemPrincipal = g.First();
                    itemPrincipal.Cantidad = g.Sum(i => i.Cantidad);
                    return itemPrincipal;
                }).ToList();

            
            carrito.Items = itemsConPromo.Concat(itemsFusionados).ToList();
        }
        #endregion
    }
}
