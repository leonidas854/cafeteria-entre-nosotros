using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Cafeteria_back.Entities.Extras;
using Cafeteria_back.Repositorio;

namespace Cafeteria_back.Controllers
{
    [Route("api/[controller]")]
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
        public async Task<ActionResult<IEnumerable<Extra>>> GetExtras()
        {
            return await _context.Extras.ToListAsync();
        }

        // GET: api/Extras/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Extra>> GetExtra(long? id)
        {
            var extra = await _context.Extras.FindAsync(id);

            if (extra == null)
            {
                return NotFound();
            }

            return extra;
        }

        // PUT: api/Extras/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPut("{id}")]
        public async Task<IActionResult> PutExtra(long? id, Extra extra)
        {
            if (id != extra.Id_extra)
            {
                return BadRequest();
            }

            _context.Entry(extra).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!ExtraExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // POST: api/Extras
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [HttpPost]
        public async Task<ActionResult<Extra>> PostExtra(Extra extra)
        {
            _context.Extras.Add(extra);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetExtra", new { id = extra.Id_extra }, extra);
        }

        // DELETE: api/Extras/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExtra(long? id)
        {
            var extra = await _context.Extras.FindAsync(id);
            if (extra == null)
            {
                return NotFound();
            }

            _context.Extras.Remove(extra);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool ExtraExists(long? id)
        {
            return _context.Extras.Any(e => e.Id_extra == id);
        }
    }
}
