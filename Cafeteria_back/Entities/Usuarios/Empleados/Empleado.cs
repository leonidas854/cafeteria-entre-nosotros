using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Entities.Ventas;

namespace Cafeteria_back.Entities.Usuarios.Empleados
{
    public class Empleado : Usuario
    {
        public string? Rol { get; set; }

        public string? CodEmpleado { get; set; }

        public DateTime? FechaContrato { get; set; }

        public List<Venta>? Ventas { get; set; }



    }
}
