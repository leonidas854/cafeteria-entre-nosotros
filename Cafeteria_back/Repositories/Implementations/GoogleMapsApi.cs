using System.Net.Http;
using System.Text.Json;

namespace Cafeteria_back.Repositories.Implementations
{
    public class GoogleMapsApi
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public GoogleMapsApi(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["GoogleMaps:ApiKey"]?? throw new ArgumentNullException("API key no configurada");
        }


        public async Task<string> GetDireccionAsync(double lat, double lon)
        {
            var url = $"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={_apiKey}";
            var response = await _httpClient.GetAsync(url);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return $"Ubicación no disponible (HTTP {(int)response.StatusCode})";

            var data = JsonSerializer.Deserialize<GoogleMapsResponse>(json);

            // Filtra por resultados que tengan como tipo "street_address"
            var direccionExacta = data?.results?
                .FirstOrDefault(r => r.types != null && r.types.Contains("street_address"))?
                .formatted_address;

            // Si no hay dirección exacta, se toma la primera como fallback
            return direccionExacta ?? data?.results?.FirstOrDefault()?.formatted_address ?? "Dirección no encontrada";
        }


        private class GoogleMapsResponse
        {
            public List<Result>? results { get; set; }
        }


        private class Result
        {
            public string? formatted_address { get; set; }
            public List<string>? types { get; set; }
        }

    }
}
