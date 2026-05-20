import axios, { AxiosError, AxiosResponse } from 'axios';
import { ApiResponse } from './types/ApiResponse';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5032/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar token JWT si existe
apiClient.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar respuestas y errores globales
apiClient.interceptors.response.use(
    (response: AxiosResponse<ApiResponse<any>>) => {
        const { data } = response;
        
        // El backend devuelve ApiResponse<T>, extraemos la propiedad 'data'
        if (data && data.success !== undefined) {
            if (!data.success) {
                // Es una respuesta fallida controlada por el backend (ej. BadRequest, NotFound encapsulado)
                return Promise.reject(new Error(data.message || 'Error desconocido del servidor'));
            }
            // Inyectamos el payload real (data.data) en response.data para que la destructuración funcione
            response.data = data.data; 
            return response; 
        }

        return response;
    },
    (error: AxiosError<ApiResponse<any>>) => {
        if (!error.response) {
            // Error de red o el servidor está completamente caído
            console.error('[Network Error]', error.message);
            error.message = 'No se pudo conectar con el servidor. Verifique su conexión.';
            return Promise.reject(error);
        }

        const status = error.response.status;
        const apiError = error.response.data?.error;

        // Manejo específico del 503 Service Unavailable (Ej. Base de datos caída)
        if (status === 503) {
            console.error('[Service Unavailable] El backend reportó que un servicio crítico no está disponible (ej. DB caída).');
            // Aquí podríamos emitir un evento para que la UI (Zustand o un Toast) muestre el mensaje de mantenimiento
        }

        if (status === 401) {
            console.warn('[Unauthorized] Token expirado o inválido. Redirigiendo a login...');
            Cookies.remove('token');
            // Opcional: window.location.href = '/login';
        }

        if (apiError) {
            error.message = apiError;
        }
        
        return Promise.reject(error);
    }
);
