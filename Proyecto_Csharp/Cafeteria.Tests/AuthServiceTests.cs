using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Cafeteria_back.Services.Implementations;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.DTOs;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Custom;
using Cafeteria_back.Repositories.Interfaces;
using System;
using System.Threading.Tasks;
using System.Linq;

namespace Cafeteria.Tests
{
    public class AuthServiceTests
    {
        private readonly MiDbContext _context;
        private readonly Mock<IUtilidades> _utilidadesMock;
        private readonly Mock<IGeolocalizador> _geoMock;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            var options = new DbContextOptionsBuilder<MiDbContext>()
                            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                            .Options;

            _context = new MiDbContext(options);
            _utilidadesMock = new Mock<IUtilidades>();
            _geoMock = new Mock<IGeolocalizador>();

            _authService = new AuthService(_context, _utilidadesMock.Object, _geoMock.Object);
        }

        [Fact]
        public async Task Login_Cliente_DebeRetornarDatos_SiCredencialesSonValidas()
        {
            // Arrange
            string encryptedPassword = "hashed123";
            _utilidadesMock.Setup(u => u.EncriptarSHA256("test123")).Returns(encryptedPassword);
            _utilidadesMock.Setup(u => u.GenerarJWT(It.IsAny<Cliente>())).Returns("mocked-jwt-token");

            var cliente = new Cliente
            {
                Id_user = 1,
                Nombre = "Leo",
                ApellidoPaterno = "López",
                Usuari = "clienteTest",
                Password = encryptedPassword,
                Nit = 12345678
            };

            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();

            var loginDto = new LoginDTO { usuario = "clienteTest", password = "test123" };

            // Act
            var result = await _authService.LoginAsync(loginDto);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.Equal("mocked-jwt-token", result.Token);
        }

        [Fact]
        public async Task Login_Cliente_DebeLanzarExcepcion_SiCredencialesSonInvalidas()
        {
            // Arrange
            _utilidadesMock.Setup(u => u.EncriptarSHA256("wrongpass")).Returns("wronghashed");
            var loginDto = new LoginDTO { usuario = "clienteTest", password = "wrongpass" };

            // Act & Assert
            await Assert.ThrowsAsync<Cafeteria_back.Exceptions.UnauthorizedException>(
                () => _authService.LoginAsync(loginDto));
        }
    }
}
