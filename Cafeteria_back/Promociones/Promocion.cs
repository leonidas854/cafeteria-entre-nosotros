using Cafeteria_back.Tablas_intermedias;
using System.ComponentModel.DataAnnotations;

namespace Cafeteria_back.Promociones
{
    public class Promocion
    {
        [Key]
        public long Id_promocion { get; set; }

        public float? Descuento { get; set; }

        public DateTime? Fech_ini { get; set; }       
        public DateTime? Fecha_final { get; set; }    

        public string? Descripcion { get; set; }

        public string? Strategykey { get; set; }

        public List<Producto_Promocion>? Producto_promocion { get; set; }
    }
}
