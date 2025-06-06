using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Cafeteria_back.Controllers;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Entities.DTOs;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Custom;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Cafeteria_back.Repositories.Interfaces;

namespace Cafeteria.Tests
{
    public class AccesoControllerTests
    {
        private readonly MiDbContext _context;
        private readonly Mock<IUtilidades> _utilidadesMock;
        private readonly Mock<IGeolocalizador> _geoMock;
        private readonly AccesoController _controller;

        public AccesoControllerTests()
        {
            var options = new DbContextOptionsBuilder<MiDbContext>()
                            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                            .EnableSensitiveDataLogging()
                            .Options;

            _context = new MiDbContext(options);

            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            _utilidadesMock = new Mock<IUtilidades>();
            _geoMock = new Mock<IGeolocalizador>();

            string plainPassword = "test123";
            string encryptedPassword = "hashed123";

            _utilidadesMock.Setup(u => u.EncriptarSHA256(plainPassword)).Returns(encryptedPassword);
            _utilidadesMock.Setup(u => u.GenerarJWT(It.IsAny<Cliente>())).Returns("mocked-jwt-token");

            var cliente = new Cliente
            {
                Id_user = 1,
                Nombre = "Leo",
                ApellidoPaterno = "López",
                ApellidoMaterno = "Gómez",
                Telefono = 77777777,
                Usuari = "clienteTest",
                Password = encryptedPassword,
                Nit = 12345678,
                Latitud = -17.336551,
                Longitud = -66.266820
            };

            _context.Clientes.Add(cliente);
            _context.SaveChanges();

            _controller = new AccesoController(_context, _utilidadesMock.Object, _geoMock.Object)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext()
                }
            };
        }

        [Fact]
        public async Task Login_Cliente_Exitoso()
        {
            var loginDto = new LoginDTO
            {
                usuario = "clienteTest",
                password = "test123"
            };

            var resultado = await _controller.Login(loginDto);
            var okResult = Assert.IsType<OkObjectResult>(resultado);

            // Convertimos a diccionario para acceder por clave
            var dict = okResult.Value!.GetType()
                .GetProperties()
                .ToDictionary(p => p.Name, p => p.GetValue(okResult.Value)!);

            Assert.True((bool)dict["isSuccess"]);
            Assert.Equal("Inicio de sesión exitoso", dict["message"]?.ToString());
        }

        [Fact]
        public async Task Login_Cliente_Invalido()
        {
            var loginDto = new LoginDTO
            {
                usuario = "clienteTest",
                password = "wrongpass"
            };

            var resultado = await _controller.Login(loginDto);
            var okResult = Assert.IsType<OkObjectResult>(resultado);

            var dict = okResult.Value!.GetType()
                .GetProperties()
                .ToDictionary(p => p.Name, p => p.GetValue(okResult.Value)!);

            Assert.False((bool)dict["isSuccess"]);
            Assert.Equal("Credenciales inválidas", dict["message"]?.ToString());
        }



    }
}
