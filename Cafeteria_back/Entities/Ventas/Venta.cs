using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Cafeteria_back.Entities.Pedidos;
using Cafeteria_back.Entities.Usuarios;

namespace Cafeteria_back.Entities.Ventas
{
    public class Venta
    {
        [Key]
        public long Id_venta { get; set; }

        [ForeignKey("Empleado")]
        public long Empleado_id { get; set; }

        public Empleado? Empleado { get; set; }

        [ForeignKey("Pedido")]
        public long Pedido_id { get; set; }

        public Pedido? Pedido { get; set; }

        public float Total_final { get; set; }

        public DateTime Ven_fecha { get; set; }

        public string? Tipo_de_Pago { get; set; }
    }
    public enum Ven_estado
    {
        Pendiente,
        Pagado
    }
}
