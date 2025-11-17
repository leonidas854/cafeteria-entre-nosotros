using Cafeteria_back.Entities.Tablas_intermedias;
using System.ComponentModel.DataAnnotations;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Cafeteria_back.Entities.Extras
{
    public class Extra
    {
        [Key]
        public long? Id_extra { get; set; }

        public float Precio { get; set; }

        public string? Name { get; set; }

        public List<Detalle_extra>? Detalle_extra { get; set; }

        public float ObtenerPrecio() => Precio;
        public string ObtenerNombre() => Name!;
    }
}
