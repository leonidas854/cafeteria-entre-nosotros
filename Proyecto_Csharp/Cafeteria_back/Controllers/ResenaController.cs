using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Custom;
using Cafeteria_back.Entities.DTOs;
using Cafeteria_back.Entities.Resenas;
using Cafeteria_back.Repositories.Implementations;
using Cafeteria_back.Repositories.Interfaces;
using System.Security.Claims;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    
    [ApiController]
    public class ResenaController : Controller
    {
        private readonly MiDbContext _context;
        public ResenaController(MiDbContext context)
        {
            _context = context;
        }
        [HttpPost]
        [Authorize]
        public async Task<IActionResult>
        Resena(resenaDTO resen)
        {
            long usuarioId;
            string? rol;
            try
            {
                usuarioId = ObtenerClienteIdDesdeToken();
                rol = User.FindFirst(ClaimTypes.Role)?.Value;
            }
            catch
            {
                return Unauthorized("Token inválido o faltan claims.");
            }
            var clienteExiste = await _context.Clientes
    .AnyAsync(c => c.Id_user == usuarioId);

            if (!clienteExiste){
                return BadRequest("El cliente del token no existe en la base de datos.");}
            var productoexiste = await _context.Productos.AnyAsync(p =>p.Id_producto == resen.Producto_id);

            if (!productoexiste)
            {
                return BadRequest("El producto no existe en la base de datos.");
            }    
                
            var resena = new Resena
            {
                comentario = resen.comentario,
                puntuacion = resen.puntuacion,
                Fech_resena = DateTime.UtcNow,
                Cliente_id = usuarioId,
                Producto_id = resen.Producto_id
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                _context.Resena.Add(resena);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error al crear resenas. Detalle: {ex.Message}");
            }
            
            return Ok(new {isSuceess = true});
        }
        [NonAction]
        private long ObtenerClienteIdDesdeToken()
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (claim == null || !long.TryParse(claim.Value, out var clienteId))
                throw new UnauthorizedAccessException("No se pudo obtener el ID del cliente desde el token.");
            return clienteId;
        }
    }
}