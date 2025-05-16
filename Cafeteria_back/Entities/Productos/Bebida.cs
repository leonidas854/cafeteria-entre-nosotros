using System.ComponentModel.DataAnnotations.Schema;

namespace Cafeteria_back.Entities.Productos
{
    public class Bebida : Producto
    {
        //public long? Id_comida { get; set; }
        //[ForeignKey("Producto")]
        //public long? producto_Id { get; set; }
        //bebida
        public string? Tamanio { get; set; }
    }
}
