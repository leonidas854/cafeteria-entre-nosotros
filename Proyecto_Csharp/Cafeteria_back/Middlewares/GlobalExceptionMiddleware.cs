using System.Net;
using System.Text.Json;
using Cafeteria_back.Exceptions;
using Cafeteria_back.Custom;

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
                _logger.LogError(ex, "Ocurrió una excepción no controlada: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            
            int statusCode = (int)HttpStatusCode.InternalServerError;
            string message = "Ocurrió un error interno en el servidor.";
            string? details = null;

            switch (exception)
            {
                case NotFoundException e:
                    statusCode = (int)HttpStatusCode.NotFound;
                    message = e.Message;
                    break;
                case UnauthorizedException e:
                    statusCode = (int)HttpStatusCode.Unauthorized;
                    message = e.Message;
                    break;
                case BadRequestException e:
                    statusCode = (int)HttpStatusCode.BadRequest;
                    message = e.Message;
                    break;
                case System.Data.Common.DbException dbEx:
                    statusCode = (int)HttpStatusCode.ServiceUnavailable;
                    message = "Servicio no disponible. Error al conectar con la base de datos.";
                    details = dbEx.Message;
                    break;
                case Exception dbInnerEx when dbInnerEx.InnerException is System.Data.Common.DbException || dbInnerEx.GetType().Name.Contains("NpgsqlException"):
                    statusCode = (int)HttpStatusCode.ServiceUnavailable;
                    message = "Servicio no disponible. Error al conectar con la base de datos.";
                    details = dbInnerEx.Message;
                    break;
                default:
                    statusCode = (int)HttpStatusCode.InternalServerError;
                    message = "Ocurrió un error inesperado.";
                    details = exception.Message;
                    break;
            }

            context.Response.StatusCode = statusCode;

            var response = ApiResponse<object>.ErrorResponse(message, details);
            
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var result = JsonSerializer.Serialize(response, options);

            return context.Response.WriteAsync(result);
        }
    }
}
