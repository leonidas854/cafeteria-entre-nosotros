using Cafeteria_back.Entities.Productos;
namespace Cafeteria_back.Entities.DTOs
{
    public class PromocionDTO
    {
        public long? id { get; set; }
        public float Descuento { get; set; }
        public DateTime Fech_ini { get; set; }
        public DateTime Fecha_final { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string Strategykey { get; set; } = string.Empty;
        public string? Url_imagen { get; set; }
        public IFormFile? Imagen { get; set; }
        public List<long> Productos { get; set; } = new();
    }



    public class PromocionTodoDTO
    {
        public long? id { get; set; }
        public float Descuento { get; set; }
        public DateTime Fech_ini { get; set; }
        public DateTime Fecha_final { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string Strategykey { get; set; } = string.Empty;
        public string? Url_imagen { get; set; }
        public List<ProductoDto> Productos { get; set; } = new();
    }
    public class ProductoDto
    {
        public long Id { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public float Precio { get; set; } 
        public string? Categoria { get; set; }
        public string? ImageUrl { get; set; }

     
    }





}
