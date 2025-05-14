namespace Cafeteria_back.Repositories.Interfaces
{
    public interface IGeolocalizador
    {
       Task<string> ObtenerDireccion(double latitud, double longitud);
    }
}
