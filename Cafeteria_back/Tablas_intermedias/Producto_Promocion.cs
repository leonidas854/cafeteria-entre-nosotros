using Cafeteria_back.Productos;
using Cafeteria_back.Promociones;
using System.ComponentModel.DataAnnotations.Schema;
namespace Cafeteria_back.Tablas_intermedias
{
    public class Producto_Promocion
    {
        public long Producto_id { get; set; }
        public long Promocion_id { get; set; }

        [ForeignKey("Producto_id")]
        public Producto? Producto { get; set; }

        [ForeignKey("Promocion_id")]
        public Promocion? Promocion { get; set; }
    }
}
