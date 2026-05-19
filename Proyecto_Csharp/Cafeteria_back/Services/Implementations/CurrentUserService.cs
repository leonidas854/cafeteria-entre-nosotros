using System.Security.Claims;
using Cafeteria_back.Exceptions;
using Cafeteria_back.Services.Interfaces;

namespace Cafeteria_back.Services.Implementations
{
    public class CurrentUserService : ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public long GetUserId()
        {
            var claim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null || !long.TryParse(claim.Value, out var userId))
            {
                throw new UnauthorizedException("No se pudo obtener el ID del usuario desde el token.");
            }
            return userId;
        }

        public string GetUserRole()
        {
            var roleClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role);
            if (roleClaim == null)
            {
                throw new UnauthorizedException("Token inválido o faltan claims de rol.");
            }
            return roleClaim.Value;
        }
    }
}
