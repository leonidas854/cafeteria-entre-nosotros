using Cafeteria_back.Tablas_intermedias;
using System.ComponentModel.DataAnnotations;

namespace Cafeteria_back.Extras
{
    public class Extra
    {
        [Key] 
        public long? Id_extra { get; set; }

        public float? Precio { get; set; }

        public string? Name { get; set; }

        public List<Detalle_extra>? Detalle_extra { get; set; }
    }
}
