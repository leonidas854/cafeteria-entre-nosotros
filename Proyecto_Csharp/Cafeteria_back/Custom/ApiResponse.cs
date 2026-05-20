namespace Cafeteria_back.Custom;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public string? Error { get; set; }

    public static ApiResponse<T> SuccessResponse(T? data = default, string message = "Operación exitosa")
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

    public static ApiResponse<T> ErrorResponse(string message, string? errorDetails = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Error = errorDetails
        };
    }
}
