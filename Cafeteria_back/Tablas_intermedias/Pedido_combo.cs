using Cafeteria_back.Combos;
using Cafeteria_back.Pedidos;
using System.ComponentModel.DataAnnotations.Schema;

namespace Cafeteria_back.Tablas_intermedias
{
    public class Pedido_combo
    {
        public long Pedido_id { get; set; }
        public long Combo_id { get; set; }

        [ForeignKey("Pedido_id")]
        public Pedido? Pedido { get; set; }

        [ForeignKey("Combo_id")]
        public Combo? Combo { get; set; }
    }
}
