using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql.TypeMapping;

namespace Cafeteria_back.Repositories.DTOs
{
    public class UsuarioPruebaDTO
    {
        public string nombre { get; set; }
        public string apell_paterno{ get; set; }
        public string apell_materno { get; set; }
        public int telefono { get; set; }
        public int NIT { get; set; }
        public string? Ubicacion {  get; set; }
        public double latitud { get; set; }
        public double longitud { get; set; }
        public string usuario { get; set; }
        public string password { get; set; }
    }
    public class UsuarioNit
    {
        public long id { get; set; }
        public string apell_paterno { get; set; }

        public int NIT { get; set; }
        public string usuario { get; set; }
        public string password { get; set; }

    }
}
