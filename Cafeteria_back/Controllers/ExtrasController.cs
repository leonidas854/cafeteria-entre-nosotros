using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cafeteria_back.Entities.Extras;
using Cafeteria_back.Repositorio;
using Cafeteria_back.Entities.DTOs;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Microsoft.AspNetCore.Authorization;
using Cafeteria_back.Custom;
using Cafeteria_back.Entities.Usuarios;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
    [Authorize]
    [ApiController]
    public class ExtrasController : ControllerBase
    {
        private readonly MiDbContext _context;

        public ExtrasController(MiDbContext context)
        {
            _context = context;
        }

        // GET: api/Extras
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExtraDTO>>> GetExtras()
        {
            var extras = await _context.Extras
                .Select(e => new ExtraDTO
                {
                    id = e.Id_extra,
                    Nombre = e.Name,
                    precio = e.Precio
                })
                .ToListAsync();

            return Ok(extras);
        }


        // GET: api/Extras/5
        //corregir luego
        [HttpGet("nombre/{Nombre}")]
        public async Task<ActionResult<Extra>> GetExtra(string Nombre)
        {
            var extra = await _context.Extras
        .FirstOrDefaultAsync(e => e.Name == Nombre);

            if (extra == null)
            {
                return NotFound();
            }
            var dtoextra = new ExtraDTO
            {
                id = extra.Id_extra,
                Nombre = extra.Name,
                precio = extra.Precio
            };

            return Ok(dtoextra); 
        }

        // PUT: api/Extras/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("Nombre/{Nombre}")]
        public async Task<IActionResult> PutExtra(string Nombre, ExtraDTO extra)
        {
            var extraExistente = await _context.Extras
                .FirstOrDefaultAsync(e => e.Name!.ToLower() == Nombre.ToLower());
            if (extraExistente == null)
            {
                return NotFound();
            }
            if (!string.Equals(extraExistente.Name, extra.Nombre, StringComparison.OrdinalIgnoreCase))
            {
                bool nombreYaExiste = await _context.Extras
                    .AnyAsync(e => e.Name!.ToLower() == extra.Nombre!.ToLower());

                if (nombreYaExiste)
                {
                    return Conflict("Ya existe un Extra con ese nombre.");
                }
            }
            extraExistente.Name = extra.Nombre;
            extraExistente.Precio = extra.precio;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                return StatusCode(500, "Error de concurrencia al guardar los cambios.");
            }

            return NoContent();
        }

        // POST: api/Extras
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult> PostExtra(ExtraDTO extra)
        {
            bool nombreYaExiste = await _context.Extras
                .AnyAsync(e => e.Name!.ToLower() == extra.Nombre!.ToLower());

            if (nombreYaExiste)
            {
                return Conflict("Ya existe un Extra con ese nombre.");
            }
            var modeloExtra = new Extra
            {
                Name = extra.Nombre,
                Precio = extra.precio
            };

            await _context.Extras.AddAsync(modeloExtra);
            await _context.SaveChangesAsync();

            if (modeloExtra.Id_extra != 0)
                return StatusCode(StatusCodes.Status200OK, new { isSuccess = true });
            else
                return StatusCode(StatusCodes.Status500InternalServerError, new { isSuccess = false });
        }


        // DELETE: api/Extras/5
        [HttpDelete("Nombre/{Nombre}")]
        public async Task<IActionResult> DeleteExtra(string Nombre)
        {
            if (string.IsNullOrWhiteSpace(Nombre))
            {
                return BadRequest("El nombre del extra no puede estar vacío.");
            }

            var extra = await _context.Extras
                .FirstOrDefaultAsync(e => string.Equals(e.Name, Nombre, StringComparison.OrdinalIgnoreCase));

            if (extra == null)
            {
                return NotFound();
            }

            _context.Extras.Remove(extra);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        



    }
}
