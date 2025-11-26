using Cafeteria_back.Entities.Extras;
using System.ComponentModel.DataAnnotations.Schema;

namespace Cafeteria_back.Entities.Tablas_intermedias
{
    public class Detalle_extra
    {
        public long Detalle_pedido_id { get; set; }
        public long Extra_id { get; set; }

        [ForeignKey("Detalle_pedido_id")]
        public Detalle_pedido? Detalle_pedido { get; set; }

        [ForeignKey("Extra_id")]
        public Extra? Extra { get; set; }
    }
}
