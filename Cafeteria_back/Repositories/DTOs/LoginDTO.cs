namespace Cafeteria_back.Repositories.DTOs
{
    public class LoginDTO
    {
        public string usuario { get; set; }
        public string password { get; set; }
    }


    public class LoginResponseDTO
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        
    }

}
