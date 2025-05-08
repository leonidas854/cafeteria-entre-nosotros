using Cafeteria_back.Combos;
using Cafeteria_back.Extras;
using Cafeteria_back.Pedidos;
using Cafeteria_back.Productos;
using Cafeteria_back.Promociones;
using Cafeteria_back.Tablas_intermedias;
using Cafeteria_back.Usuarios.Clientes;
using Cafeteria_back.Usuarios.Empleados;
using Cafeteria_back.Ventas;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria_back.Repositorio
{
    public class MiDbContext:DbContext
    {
        public MiDbContext(DbContextOptions<MiDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Cliente>().ToTable("Cliente");
            modelBuilder.Entity<Empleado>().ToTable("Empleado");
            modelBuilder.Entity<Combo_producto>()
                .HasKey(cp => new { cp.Combo_id, cp.Producto_id });

            modelBuilder.Entity<Pedido_combo>()
                .HasKey(pc => new { pc.Pedido_id, pc.Combo_id });

            modelBuilder.Entity<Producto_Promocion>()
                .HasKey(pp => new { pp.Producto_id, pp.Promocion_id });

            modelBuilder.Entity<Detalle_extra>()
                .HasKey(de => new { de.Detalle_pedido_id, de.Extra_id });

            base.OnModelCreating(modelBuilder);
        }
        public DbSet<Combo> Combos { get; set; }
        public DbSet<Extra> Extras { get; set; }
        public DbSet<Pedido> Pedidos { get; set; }
        public DbSet<Producto> Productos { get; set; }
       
        public DbSet<Promocion> Promociones { get; set; }
        
        
        public DbSet<Combo_producto> CombosProducto { get; set; }
        public DbSet<Detalle_extra> DetalleExtra { get; set; }
        public DbSet<Detalle_pedido> DetallesPedido { get; set; }
        public DbSet<Pedido_combo> PedidoCombos { get; set; }

        public DbSet<Producto_Promocion> ProductopPromocion { get; set; }
        public DbSet<Venta> Ventas { get; set; }
       

    }
}
