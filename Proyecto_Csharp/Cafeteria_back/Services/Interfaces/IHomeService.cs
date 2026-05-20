namespace Cafeteria_back.Services.Interfaces
{
    public interface IHomeService
    {
        Task<string> AgregarVariosAsync(int repeticiones);
    }
}
