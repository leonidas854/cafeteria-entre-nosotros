using Cafeteria_back.Combos;
using Cafeteria_back.Productos;
using System.ComponentModel.DataAnnotations.Schema;

namespace Cafeteria_back.Tablas_intermedias
{
    public class Combo_producto
    {
        public long Combo_id { get; set; }
        public long Producto_id { get; set; }

        public int? Cantidad { get; set; }

        [ForeignKey("Combo_id")]
        public Combo? Combo { get; set; }

        [ForeignKey("Producto_id")]
        public Producto? Producto { get; set; }
    }
}
