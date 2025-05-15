using System.Globalization;
using System.Net.Http;
using Newtonsoft.Json;

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
            var url = $"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat.ToString(CultureInfo.InvariantCulture)},{lon.ToString(CultureInfo.InvariantCulture)}&key={_apiKey}";

            var response = await _httpClient.GetAsync(url);
            var json = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return $"Ubicación no disponible (HTTP {(int)response.StatusCode})";

            var data = JsonConvert.DeserializeObject<GoogleMapsResponse>(json);

            var resultadoConCalleYNumero = data?.results?
                .FirstOrDefault(r =>
                    r.address_components != null &&
                    r.address_components.Any(c => c.types != null && c.types.Contains("street_number")) &&
                    r.address_components.Any(c => c.types != null && c.types.Contains("route"))
                );

            return resultadoConCalleYNumero?.formatted_address
                ?? data?.results?.FirstOrDefault()?.formatted_address
                ?? "Dirección no encontrada";
        }


        private class GoogleMapsResponse
        {
            public List<Result>? results { get; set; }
        }
        private class Result
        {
            public string? formatted_address { get; set; }
            public List<string>? types { get; set; }
            public List<AddressComponent>? address_components { get; set; }
        }

        private class AddressComponent
        {
            public string? long_name { get; set; }
            public string? short_name { get; set; }
            public List<string>? types { get; set; }
        }


    }
}
