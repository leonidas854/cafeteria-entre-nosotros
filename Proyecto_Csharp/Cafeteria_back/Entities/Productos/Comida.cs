using System.ComponentModel.DataAnnotations.Schema;

namespace Cafeteria_back.Entities.Productos
{
    public class Comida:Producto
    {
        //public long? Id_comida { get; set; }
        //[ForeignKey("Producto")]
        //public long? producto_Id { get; set; }
        //comida
        public string? Proporcion {  get; set; }
    }
}
