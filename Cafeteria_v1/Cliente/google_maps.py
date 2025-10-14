import requests
import os

def get_direccion(lat, lon):
    api_key ='AIzaSyBfXzcQdM7G7JnRxcfQlcsUnVxwrhcuIeE'
    url = f"https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}&key={api_key}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        if data.get("results"):
            resultado_con_calle_y_numero = None
            for result in data["results"]:
                if 'address_components' in result:
                    has_street_number = any("street_number" in component.get("types", []) for component in result["address_components"])
                    has_route = any("route" in component.get("types", []) for component in result["address_components"])
                    if has_street_number and has_route:
                        resultado_con_calle_y_numero = result
                        break  
            if resultado_con_calle_y_numero:
                return resultado_con_calle_y_numero.get("formatted_address")
            return data["results"][0].get("formatted_address")

        else:
            return "No se encontraron resultados para la ubicación proporcionada."

    except requests.exceptions.HTTPError as http_err:
        return f"Ubicación no disponible (Error HTTP: {http_err.response.status_code})"
    except requests.exceptions.RequestException as req_err:
        return f"Error en la solicitud: {req_err}"
    except Exception as e:
        return f"Ha ocurrido un error inesperado: {e}"
