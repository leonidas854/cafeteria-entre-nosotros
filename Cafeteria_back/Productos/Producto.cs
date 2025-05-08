using Cafeteria_back.Tablas_intermedias;
using System.ComponentModel.DataAnnotations;

namespace Cafeteria_back.Productos
{
    public class Producto
    {
        [Key]
        public long Id_producto { get; set; }

        public string? Tipo { get; set; }

        public string? Descripcion { get; set; }

        public string? Nombre { get; set; }

        public float? Precio { get; set; }

        public bool? Estado { get; set; } 
        public string? Image_url {  get; set; } 

        public List<Detalle_pedido>? Detalle_pedido { get; set; }

        public List<Producto_Promocion>? Producto_promocion { get; set; }

        public List<Combo_producto>? Combo_producto { get; set; }
    }
}
