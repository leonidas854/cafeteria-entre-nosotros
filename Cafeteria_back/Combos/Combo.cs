using Cafeteria_back.Tablas_intermedias;
using System.ComponentModel.DataAnnotations;

namespace Cafeteria_back.Combos
{
    public class Combo
    {
        [Key] 
        public long? Idcombo { get; set; }

        public string? Nombre { get; set; }
        public float? Precio_combo { get; set; }

        public List<Combo_producto>? Combo_producto { get; set; }
        public List<Pedido_combo>? Pedido_combo { get; set; }
    }

}
