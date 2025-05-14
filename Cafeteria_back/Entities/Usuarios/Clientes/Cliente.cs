using Cafeteria_back.Entities.Pedidos;
using Cafeteria_back.Entities.Usuarios;

namespace Cafeteria_back.Entities.Usuarios.Clientes
{
    public class Cliente : Usuario
    {
        public string? Ubicacion { get; set; }

        public int? Nit { get; set; }

        public double? Latitud { get; set; }

        public double? Longitud { get; set; }

        public List<Pedido>? Pedidos { get; set; }
    }
}
