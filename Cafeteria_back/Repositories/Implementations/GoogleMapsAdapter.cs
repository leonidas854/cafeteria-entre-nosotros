using Cafeteria_back.Repositories.Interfaces;

namespace Cafeteria_back.Repositories.Implementations
{
    public class GoogleMapsAdapter:IGeolocalizador
    {
        private readonly GoogleMapsApi _api;
        public GoogleMapsAdapter(GoogleMapsApi api) {
            _api = api;
        }
        public string ObtenerDireccion(double lat, double lon)
        {
            return _api.GetDireccion(lat, lon);
        }
    }
}
