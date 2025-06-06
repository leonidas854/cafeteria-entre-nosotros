using Cafeteria_back.Custom;
using Cafeteria_back.Entities.DTOs;
using Cafeteria_back.Entities.Productos;
using Cafeteria_back.Repositorio;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Cafeteria_back.Controllers
{

    [ApiController]
    
    [Route("api/[controller]")]
    [Authorize]
    public class AgregacionController : Controller
    {
        private readonly MiDbContext _context;
        private readonly Utilidades _utilidades;
        public AgregacionController(MiDbContext context,Utilidades utilidades)
        {
            _context = context;
            _utilidades = utilidades;
        }

        [HttpGet("Producto/Categorias")]
        public async Task<ActionResult<IEnumerable<string>>> GetCategorias()
        {
            var categorias = await _context.Productos
                .Where(p => p.Categoria != null) 
                .Select(p => p.Categoria!)
                .Distinct()
                .ToListAsync();

            return Ok(categorias);
        }
        [HttpGet("Producto/Subcategorias")]
        public async Task<ActionResult<IEnumerable<string>>> GetSubcategorias([FromQuery] string categoria)
        {
            if (string.IsNullOrWhiteSpace(categoria))
                return BadRequest("Debe proporcionar una categoría.");

            var subcategorias = await _context.Productos
                .Where(p => p.Categoria == categoria && p.Sub_categoria != null)
                .Select(p => p.Sub_categoria!)
                .Distinct()
                .ToListAsync();

            return Ok(subcategorias);
        }
        [HttpGet("Producto/Sabores")]
        public async Task<ActionResult<IEnumerable<string>>> GetSabores()
        {
            var categorias = await _context.Productos
                .Where(p => p.Sabores != null)
                .Select(p => new { p.Categoria,p.Sabores })
                .Distinct()
                .ToListAsync();

            return Ok(categorias);
        }

        [HttpGet("Empleado/Roles")]
        public async Task <ActionResult<IEnumerable<string>>> GetRoles()
        {
            var roles = await _context.Empleados
                .Where(r=> r.Rol !=null)
                .Select(r => r.Rol)
                .Distinct()
                .ToListAsync();
            return Ok(roles);
        }
        [HttpGet("Producto/Productos")]
        public async Task<ActionResult<IEnumerable<ProductoDTO__>>> GetProductos()
        {
            var Productos = await _context.Productos
                .Where(r => r.Estado == true && r.Nombre != null)
                .Select(r => new ProductoDTO__
                {
                    Id_producto = r.Id_producto,
                    Nombre = r.Nombre!
                })
                .ToListAsync();
            return Ok(Productos);
        }
        [HttpPost("Confirmar")]
        public async Task<ActionResult<string>> Confirmar([FromBody] string contra)
        {


            long clienteId;
            try
            {
                clienteId = ObtenerClienteIdDesdeToken();
            }
            catch
            {
                return Unauthorized("Token inválido o faltan claims.");
            }
            var usuarioEncontrado = await _context.Empleados
                .Where(u => u.Password == _utilidades.EncriptarSHA256(contra)
                && u.Id_user==clienteId)
                .Select(u => u.Nombre) 
                .FirstOrDefaultAsync();

            if (usuarioEncontrado == null)
                return NotFound("Usuario no encontrado");

            return Ok(usuarioEncontrado);
        }


        private long ObtenerClienteIdDesdeToken()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim == null || !long.TryParse(claim.Value, out var clienteId))
                throw new UnauthorizedAccessException("No se pudo obtener el ID del cliente desde el token.");
            return clienteId;
        }
       
            







        }
}
