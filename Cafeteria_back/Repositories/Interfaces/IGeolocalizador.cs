namespace Cafeteria_back.Repositories.Interfaces
{
    public interface IGeolocalizador
    {
        public string ObtenerDireccion(double lat, double lon);
    }
}
