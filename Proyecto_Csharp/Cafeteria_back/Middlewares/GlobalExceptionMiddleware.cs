using System.Net;
using System.Text.Json;
using Cafeteria_back.Exceptions;

namespace Cafeteria_back.Middlewares
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Ocurrió una excepción no controlada: {ex.Message}");
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            var statusCode = exception switch
            {
                NotFoundException => (int)HttpStatusCode.NotFound,
                UnauthorizedException => (int)HttpStatusCode.Unauthorized,
                BadRequestException => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError
            };

            context.Response.StatusCode = statusCode;

            var result = JsonSerializer.Serialize(new
            {
                StatusCode = statusCode,
                Message = exception.Message,
                // Mostrar el stack trace solo en desarrollo podría ser buena práctica, pero por ahora mostramos mensaje genérico
                Details = statusCode == 500 ? "Ocurrió un error interno en el servidor." : null
            });

            return context.Response.WriteAsync(result);
        }
    }
}
