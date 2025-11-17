namespace Cafeteria_back.Entities.DTOs
{
    public class EmpleadoDTO
    {
        public string? nombre { get; set; }
        public string? apell_paterno { get; set; }
        public string? apell_materno { get; set; }
        public int telefono { get; set; }
       
        public string? usuario { get; set; }
        public string? password { get; set; }
        public DateTime? fecha_contrato { get; set; }
      
        public string? Empleado_rol {  get; set; }
    }

    public class EmpleadoUpdateDTO 
    {
        public string? nombre { get; set; }
        public string? apell_paterno { get; set; }
        public string? apell_materno { get; set; }
        public int telefono { get; set; }
    
        public string? password { get; set; } 
        public string? Empleado_rol { get; set; }
    }
}
