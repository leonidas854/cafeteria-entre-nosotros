namespace Cafeteria_back.Entities.DTOs
{
    public class PromocionDTO
    {
        public float Descuento { get; set; }
        public DateTime Fech_ini { get; set; }
        public DateTime Fecha_final { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string Strategykey { get; set; } = string.Empty;
        public List<string> Productos { get; set; } = new();
    }
}
