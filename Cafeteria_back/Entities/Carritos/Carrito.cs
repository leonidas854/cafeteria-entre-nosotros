using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System.Text.Json.Serialization;

namespace Cafeteria_back.Entities.Carritos
{
    public class Carrito
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public string? Id { get; set; }

        public long ClienteId { get; set; }
        public List<ItemCarrito> Items { get; set; } = new();
        
    }
    public class ItemCarrito
    {
        public long ProductoId { get; set; }
        public string Nombre { get; set; }          
        public float PrecioUnitario { get; set; }    
        public int Cantidad { get; set; }
        public List<ExtraCarrito> Extras { get; set; } = new();

        public bool TienePromocion { get; set; }
        public float? PrecioPromocional { get; set; }
        public string? DescripcionPromocion { get; set; }

    }
    public class ExtraCarrito
    {
        public long ExtraId { get; set; }
        public string Nombre { get; set; }
        public float Precio { get; set; }
    }
    public class ModificarCantidadDto
    {
        public long ProductoId { get; set; }
        public int NuevaCantidad { get; set; }
        public List<long> ExtraIds { get; set; }
    }
    public class ModificarExtrasDto
    {
        public long ProductoId { get; set; }
        public List<ExtraCarrito> NuevosExtras { get; set; } = new();
    }
    public class QuitarProductoDto
    {
        public long ProductoId { get; set; }
        public List<long> ExtraIds { get; set; } = new();
    }





}
