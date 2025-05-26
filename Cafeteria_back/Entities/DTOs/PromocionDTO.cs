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

    


}
