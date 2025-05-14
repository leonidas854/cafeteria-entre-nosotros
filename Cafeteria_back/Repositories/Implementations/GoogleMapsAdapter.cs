using Cafeteria_back.Repositories.Interfaces;

namespace Cafeteria_back.Repositories.Implementations
{
    public class GoogleMapsAdapter:IGeolocalizador
    {
        private readonly GoogleMapsApi _api;
        public GoogleMapsAdapter(GoogleMapsApi api) {
            _api = api;
        }
        public async Task<string> ObtenerDireccion(double latitud, double longitud)
        {
            return await _api.GetDireccionAsync(latitud, longitud);
        }

    }
}
