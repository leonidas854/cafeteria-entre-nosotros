namespace Cafeteria_back.Repositories.DTOs
{
    public class ProductoDTO
    {
        public string? Tipo { get; set; }
        public string? Categoria { get; set; }
        public string? Sub_categoria { get; set; }

        public string? Descripcion { get; set; }

        public string? Nombre { get; set; }

        public float Precio { get; set; }

        public bool Estado { get; set; }
        public string? Sabores { get; set; }
        public IFormFile? Imagen { get; set; }  
        public string? Proporcion { get; set; }
        public string? Tamanio { get; set; }
        public string? Image_url { get; set; }
    }
    public class ProductoDTO_
    {
        public long id { get; set; }
        public string? Tipo { get; set; }
        public string? Categoria { get; set; }
        public string? Sub_categoria { get; set; }

        public string? Descripcion { get; set; }

        public string? Nombre { get; set; }

        public float Precio { get; set; }

        public bool Estado { get; set; }
        public string? Sabores { get; set; }
        public IFormFile? Imagen { get; set; }
        public string? Proporcion { get; set; }
        public string? Tamanio { get; set; }
        public string? Image_url { get; set; }
    }
    public class ProductoDTO__
    {
        public long Id_producto { get; set; }
        public string Nombre { get; set; }
    }

}
