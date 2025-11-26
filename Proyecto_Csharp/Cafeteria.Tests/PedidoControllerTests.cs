using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Cafeteria_back.Controllers;
using Cafeteria_back.Entities.Pedidos;
using Cafeteria_back.Entities.Extras;
using Cafeteria_back.Entities.Productos;
using Cafeteria_back.Entities.Tablas_intermedias;
using Cafeteria_back.Repositories.Implementations;
using Cafeteria_back.Entities.Carritos;
using Cafeteria_back.Repositorio;

namespace Cafeteria.Tests
{
    public class PedidoControllerTests
    {
        private readonly MiDbContext _context;
        private readonly PedidoController _controller;

        public PedidoControllerTests()
        {
            var options = new DbContextOptionsBuilder<MiDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_Pedidos")
                .Options;

            _context = new MiDbContext(options);

            // Datos de prueba
            var pedido = new Pedido
            {
                Id_pedido = 1,
                Cliente_id = 123,
                Total_estimado = 20,
                Total_descuento = 2,
                Tipo_Entrega = Tipo_entrega.Delivery,
                estado = Estado_pedido.En_espera,
                Detalle_pedido = new List<Detalle_pedido>
                {
                    new Detalle_pedido
                    {
                        Producto_id = 1,
                        Cantidad = 1,
                        Precio_unitario = 18,
                        Detalle_extras = new List<Detalle_extra>
                        {
                            new Detalle_extra
                            {
                                Extra_id = 1,
                                Extra = new Extra { Name = "Leche", Precio = 2 }
                            }
                        },
                        Producto = new Producto { Nombre = "Café" }
                    }
                }
            };

            _context.Pedidos.Add(pedido);
            _context.SaveChanges();

            // Mock de CarritoService (solo es requerido en el constructor, no para esta prueba)
            var carritoServiceMock = new Mock<ICarritoService>();
            var descuentoContext = new DescuentoStrategyContext(); // Si no se usa directamente en esta prueba, lo dejamos así

            _controller = new PedidoController(carritoServiceMock.Object, _context, descuentoContext);

            // Simular token JWT con Claim del cliente
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                     {
                        new Claim(ClaimTypes.NameIdentifier, "123")
                     }, "mock"));

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

        }

        [Fact]
        public async Task ObtenerMisPedidos_DeberiaRetornarPedidos()
        {
            // Act
            var resultado = await _controller.ObtenerMisPedidos();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(resultado);
            var pedidos = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);

            Assert.Single(pedidos);
        }
    }
}
