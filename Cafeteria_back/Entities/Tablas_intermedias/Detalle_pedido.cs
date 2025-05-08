using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Cafeteria_back.Entities.Pedidos;
using Cafeteria_back.Entities.Productos;

namespace Cafeteria_back.Entities.Tablas_intermedias
{
    public class Detalle_pedido
    {
        [Key]
        public long Id_detalle_pedido { get; set; }

        public long Pedido_id { get; set; }
        public long Producto_id { get; set; }

        public int? Cantidad { get; set; }
        public float? Precio_unitario { get; set; }
        public float? Sub_total { get; set; }

        [ForeignKey("Pedido_id")]
        public Pedido? Pedido { get; set; }

        [ForeignKey("Producto_id")]
        public Producto? Producto { get; set; }
    }
}
