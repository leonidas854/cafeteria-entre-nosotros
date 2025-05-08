using Cafeteria_back.Pedidos;
namespace Cafeteria_back.Usuarios.Clientes
{
    public class Cliente : Usuario
    {
        public string? Ubicacion { get; set; }

        public int? Nit { get; set; }

        public float? Latitud { get; set; }

        public float? Longitud { get; set; }

        public List<Pedido>? Pedidos { get; set; }
    }
}
