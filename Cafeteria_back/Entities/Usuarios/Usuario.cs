using System.ComponentModel.DataAnnotations;

namespace Cafeteria_back.Entities.Usuarios
{
    public abstract class Usuario
    {
        [Key]
        public long Id_user { get; set; }

        [Required]
        public string? Nombre { get; set; }

        public string? ApellidoPaterno { get; set; }

        public string? ApellidoMaterno { get; set; }

        public int Telefono { get; set; }

        [Required]
        public string? Usuari { get; set; }

        [Required]
        public string? Password { get; set; }
    }


}
