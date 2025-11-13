

using Cafeteria_back.Entities.Usuarios;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Cafeteria_back.Entities.Productos;

namespace Cafeteria_back.Entities.Resenas
{
    public class Resena
    {

        [Key]
        public long Id_resena { get; set; }
        public string? comentario { get; set; }

        public int puntuacion { get; set; }

        public DateTime? Fech_resena { get; set; }

        [ForeignKey("Cliente_id")]
        public Cliente? Cliente { get; set; }

        //[ForeignKey("Producto_id")]
        //public Producto? Producto { get; set; }

    }
}