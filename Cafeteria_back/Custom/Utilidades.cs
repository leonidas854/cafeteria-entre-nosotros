using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Entities.Usuarios.Clientes;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
namespace Cafeteria_back.Custom
{
    public class Utilidades
    {
        public readonly IConfiguration Configuration;
        public Utilidades(IConfiguration configuration)
        {
            Configuration = configuration;
        }
        public string EncriptarSHA256(string texto)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(texto));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
            
        }
        public string generarJWT(Cliente cliente)
        {
            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, cliente.Id_user.ToString()),
                new Claim(ClaimTypes.Email, cliente.Usuari!)
            };
            var SecurityKey = new SymmetricSecurityKey
                (Encoding.UTF8.GetBytes(Configuration["Jwt:key"]!));
            var credentials = new SigningCredentials
                (SecurityKey, SecurityAlgorithms.HmacSha256Signature);
            var jwtConfig = new JwtSecurityToken(
                claims:userClaims,
                expires: DateTime.UtcNow.AddHours(5),
                signingCredentials:credentials);
            return new JwtSecurityTokenHandler().WriteToken(jwtConfig);
        }
    }

}
