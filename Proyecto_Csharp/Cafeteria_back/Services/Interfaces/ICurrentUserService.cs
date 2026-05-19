namespace Cafeteria_back.Services.Interfaces
{
    public interface ICurrentUserService
    {
        long GetUserId();
        string GetUserRole();
    }
}
