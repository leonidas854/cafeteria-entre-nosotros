using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Cafeteria_back.Controllers;
using Cafeteria_back.Entities.Carritos;
using Cafeteria_back.Repositorio;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria.Tests
{
    public class CarritoControllerTests
    {
        private readonly Mock<ICarritoService> _carritoServiceMock;
        private readonly MiDbContext _fakeDbContext;
        private readonly CarritoController _controller;

        public CarritoControllerTests()
        {
            // 1. Instancia real de DbContext con InMemory
            var options = new DbContextOptionsBuilder<MiDbContext>()
                .UseInMemoryDatabase("TestCarrito")
                .Options;

            _fakeDbContext = new MiDbContext(options);

            // 2. Mock de ICarritoService
            _carritoServiceMock = new Mock<ICarritoService>();

            // 3. Setup del servicio con un carrito simulado
            var carritoSimulado = new Carrito
            {
                Id = "abc123",
                ClienteId = 1,
                Items = new List<ItemCarrito>
            {
                new ItemCarrito
                {
                    ProductoId = 101,
                    Nombre = "Café",
                    Cantidad = 1,
                    PrecioUnitario = 10.5f,
                    Extras = new List<ExtraCarrito>()
                }
            }
            };

            _carritoServiceMock
                .Setup(c => c.ObtenerPorCliente(1))
                .ReturnsAsync(carritoSimulado);

            // 4. Controlador
            _controller = new CarritoController(_carritoServiceMock.Object, _fakeDbContext);

            // 5. Usuario simulado en el contexto HTTP
            var claims = new[]
            {
            new Claim(ClaimTypes.NameIdentifier, "1"),
            new Claim(ClaimTypes.Role, "Cliente")
        };

            var identity = new ClaimsIdentity(claims, "mock");
            var user = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task Obtener_DeberiaRetornarOkConCarrito()
        {
            // Act
            var resultado = await _controller.Obtener();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(resultado);
            var carrito = Assert.IsType<Carrito>(okResult.Value);

            Assert.Equal("abc123", carrito.Id);
            Assert.Single(carrito.Items);
            Assert.Equal("Café", carrito.Items[0].Nombre);
        }
    }

}
