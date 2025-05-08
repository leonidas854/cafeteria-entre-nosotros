using Cafeteria_back.Ventas;

namespace Cafeteria_back.Usuarios.Empleados
{
    public class Empleado : Usuario
    {
        public string? Rol { get; set; }           

        public string? CodEmpleado { get; set; }     

        public DateTime? FechaContrato { get; set; }

        public List<Venta>? Ventas { get; set; }    

        
       
    }
}
