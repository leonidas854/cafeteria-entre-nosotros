
using Cafeteria_back.Entities.Extras;
using Cafeteria_back.Entities.Pedidos;
using Cafeteria_back.Entities.Productos;
using Cafeteria_back.Entities.Promociones;
using Cafeteria_back.Entities.Tablas_intermedias;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Entities.Ventas;
using Microsoft.EntityFrameworkCore;

namespace Cafeteria_back.Repositorio
{
    public class MiDbContext:DbContext
    {
        public MiDbContext(DbContextOptions<MiDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Producto>().ToTable("Producto");
            modelBuilder.Entity<Bebida>().ToTable("Bebida");
            modelBuilder.Entity<Comida>().ToTable("Comida");

            modelBuilder.Entity<Cliente>().ToTable("Cliente");
            modelBuilder.Entity<Empleado>().ToTable("Empleado");
            

            // Relación uno a uno Producto - Bebida
            modelBuilder.Entity<Producto>()
                .HasOne<Bebida>()
                .WithOne()
                .HasForeignKey<Bebida>(b => b.Id_producto)
                .OnDelete(DeleteBehavior.Cascade);

            // Relación uno a uno Producto - Comida
            modelBuilder.Entity<Producto>()
                .HasOne<Comida>()
                .WithOne()
                .HasForeignKey<Comida>(c => c.Id_producto)
                .OnDelete(DeleteBehavior.Cascade);

            // Relación muchos a muchos Producto - Promoción
            modelBuilder.Entity<Producto_Promocion>()
                .HasKey(pp => new { pp.Producto_id, pp.Promocion_id });

            modelBuilder.Entity<Producto_Promocion>()
                .HasOne(pp => pp.Producto)
                .WithMany(p => p.Producto_promocion)
                .HasForeignKey(pp => pp.Producto_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Producto_Promocion>()
                .HasOne(pp => pp.Promocion)
                .WithMany(p => p.Producto_promocion)
                .HasForeignKey(pp => pp.Promocion_id)
                .OnDelete(DeleteBehavior.Cascade);

            // Detalle_extra
            modelBuilder.Entity<Detalle_extra>()
                .HasKey(de => new { de.Detalle_pedido_id, de.Extra_id });

            modelBuilder.Entity<Detalle_extra>()
                .HasKey(de => new { de.Detalle_pedido_id, de.Extra_id }); // clave compuesta

            modelBuilder.Entity<Detalle_extra>()
                .HasOne(de => de.Detalle_pedido)
                .WithMany(dp => dp.Detalle_extras)
                .HasForeignKey(de => de.Detalle_pedido_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Detalle_extra>()
                .HasOne(de => de.Extra)
                .WithMany(e => e.Detalle_extra)
                .HasForeignKey(de => de.Extra_id)
                .OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<Pedido>()
                .HasOne(p => p.Venta)
                .WithOne(v => v.Pedido)
                .HasForeignKey<Venta>(v => v.Pedido_id);

            base.OnModelCreating(modelBuilder);
        }

        public virtual DbSet<Cliente> Clientes { get; set; }
        public virtual DbSet<Empleado> Empleados { get; set; }

        public virtual DbSet<Extra> Extras { get; set; }
        public virtual DbSet<Pedido> Pedidos { get; set; }
        public virtual DbSet<Producto> Productos { get; set; }
        public virtual DbSet<Bebida> Bebidas { get; set; }
        public virtual DbSet<Comida> Comidas { get; set; }


        public virtual DbSet<Promocion> Promociones { get; set; }
        
        
       
        public virtual DbSet<Detalle_extra> DetalleExtra { get; set; }
        public virtual DbSet<Detalle_pedido> DetallesPedido { get; set; }
      

        public virtual  DbSet<Producto_Promocion> ProductopPromocion { get; set; }
        public virtual DbSet<Venta> Ventas { get; set; }
       

    }
}
