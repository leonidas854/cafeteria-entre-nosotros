using Cafeteria_back.Entities.Pedidos;

namespace Cafeteria_back.Entities.Usuarios
{
    public class Empleado : Usuario
    {
        public string? Rol { get; set; }

       // public string? CodEmpleado { get; set; }

        public DateTime? FechaContrato { get; set; }

        public List<Venta>? Ventas { get; set; }



    }
}
