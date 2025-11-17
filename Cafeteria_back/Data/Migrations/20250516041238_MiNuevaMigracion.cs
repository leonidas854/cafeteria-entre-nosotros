using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Cafeteria_back.Migrations
{
    /// <inheritdoc />
    public partial class MiNuevaMigracion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cliente",
                columns: table => new
                {
                    Id_user = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Ubicacion = table.Column<string>(type: "text", nullable: true),
                    Nit = table.Column<int>(type: "integer", nullable: true),
                    Latitud = table.Column<double>(type: "double precision", nullable: true),
                    Longitud = table.Column<double>(type: "double precision", nullable: true),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    ApellidoPaterno = table.Column<string>(type: "text", nullable: true),
                    ApellidoMaterno = table.Column<string>(type: "text", nullable: true),
                    Telefono = table.Column<int>(type: "integer", nullable: true),
                    Usuari = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cliente", x => x.Id_user);
                });

            migrationBuilder.CreateTable(
                name: "Empleado",
                columns: table => new
                {
                    Id_user = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Rol = table.Column<string>(type: "text", nullable: true),
                    FechaContrato = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Nombre = table.Column<string>(type: "text", nullable: false),
                    ApellidoPaterno = table.Column<string>(type: "text", nullable: true),
                    ApellidoMaterno = table.Column<string>(type: "text", nullable: true),
                    Telefono = table.Column<int>(type: "integer", nullable: true),
                    Usuari = table.Column<string>(type: "text", nullable: false),
                    Password = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empleado", x => x.Id_user);
                });

            migrationBuilder.CreateTable(
                name: "Extras",
                columns: table => new
                {
                    Id_extra = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Precio = table.Column<float>(type: "real", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Extras", x => x.Id_extra);
                });

            migrationBuilder.CreateTable(
                name: "Producto",
                columns: table => new
                {
                    Id_producto = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Tipo = table.Column<string>(type: "text", nullable: true),
                    Categoria = table.Column<string>(type: "text", nullable: true),
                    Sub_categoria = table.Column<string>(type: "text", nullable: true),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Nombre = table.Column<string>(type: "text", nullable: true),
                    Precio = table.Column<float>(type: "real", nullable: true),
                    Estado = table.Column<bool>(type: "boolean", nullable: true),
                    Sabores = table.Column<string>(type: "text", nullable: true),
                    Image_url = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Producto", x => x.Id_producto);
                });

            migrationBuilder.CreateTable(
                name: "Promociones",
                columns: table => new
                {
                    Id_promocion = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Descuento = table.Column<float>(type: "real", nullable: true),
                    Fech_ini = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Fecha_final = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Descripcion = table.Column<string>(type: "text", nullable: true),
                    Strategykey = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Promociones", x => x.Id_promocion);
                });

            migrationBuilder.CreateTable(
                name: "Pedidos",
                columns: table => new
                {
                    Id_pedido = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Cliente_id = table.Column<long>(type: "bigint", nullable: false),
                    Total_estimado = table.Column<float>(type: "real", nullable: true),
                    Total_descuento = table.Column<float>(type: "real", nullable: true),
                    Tipo_Entrega = table.Column<int>(type: "integer", nullable: true),
                    estado = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Pedidos", x => x.Id_pedido);
                    table.ForeignKey(
                        name: "FK_Pedidos_Cliente_Cliente_id",
                        column: x => x.Cliente_id,
                        principalTable: "Cliente",
                        principalColumn: "Id_user",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Bebida",
                columns: table => new
                {
                    Id_producto = table.Column<long>(type: "bigint", nullable: false),
                    Tamanio = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bebida", x => x.Id_producto);
                    table.ForeignKey(
                        name: "FK_Bebida_Producto_Id_producto",
                        column: x => x.Id_producto,
                        principalTable: "Producto",
                        principalColumn: "Id_producto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Comida",
                columns: table => new
                {
                    Id_producto = table.Column<long>(type: "bigint", nullable: false),
                    Proporcion = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Comida", x => x.Id_producto);
                    table.ForeignKey(
                        name: "FK_Comida_Producto_Id_producto",
                        column: x => x.Id_producto,
                        principalTable: "Producto",
                        principalColumn: "Id_producto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductopPromocion",
                columns: table => new
                {
                    Producto_id = table.Column<long>(type: "bigint", nullable: false),
                    Promocion_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductopPromocion", x => new { x.Producto_id, x.Promocion_id });
                    table.ForeignKey(
                        name: "FK_ProductopPromocion_Producto_Producto_id",
                        column: x => x.Producto_id,
                        principalTable: "Producto",
                        principalColumn: "Id_producto",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductopPromocion_Promociones_Promocion_id",
                        column: x => x.Promocion_id,
                        principalTable: "Promociones",
                        principalColumn: "Id_promocion",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DetallesPedido",
                columns: table => new
                {
                    Id_detalle_pedido = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Pedido_id = table.Column<long>(type: "bigint", nullable: false),
                    Producto_id = table.Column<long>(type: "bigint", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: true),
                    Precio_unitario = table.Column<float>(type: "real", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetallesPedido", x => x.Id_detalle_pedido);
                    table.ForeignKey(
                        name: "FK_DetallesPedido_Pedidos_Pedido_id",
                        column: x => x.Pedido_id,
                        principalTable: "Pedidos",
                        principalColumn: "Id_pedido",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DetallesPedido_Producto_Producto_id",
                        column: x => x.Producto_id,
                        principalTable: "Producto",
                        principalColumn: "Id_producto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Ventas",
                columns: table => new
                {
                    Id_venta = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Empleado_id = table.Column<long>(type: "bigint", nullable: false),
                    Pedido_id = table.Column<long>(type: "bigint", nullable: false),
                    Total_final = table.Column<float>(type: "real", nullable: false),
                    Ven_fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Tipo_de_Pago = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Ventas", x => x.Id_venta);
                    table.ForeignKey(
                        name: "FK_Ventas_Empleado_Empleado_id",
                        column: x => x.Empleado_id,
                        principalTable: "Empleado",
                        principalColumn: "Id_user",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Ventas_Pedidos_Pedido_id",
                        column: x => x.Pedido_id,
                        principalTable: "Pedidos",
                        principalColumn: "Id_pedido",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DetalleExtra",
                columns: table => new
                {
                    Detalle_pedido_id = table.Column<long>(type: "bigint", nullable: false),
                    Extra_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DetalleExtra", x => new { x.Detalle_pedido_id, x.Extra_id });
                    table.ForeignKey(
                        name: "FK_DetalleExtra_DetallesPedido_Detalle_pedido_id",
                        column: x => x.Detalle_pedido_id,
                        principalTable: "DetallesPedido",
                        principalColumn: "Id_detalle_pedido",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DetalleExtra_Extras_Extra_id",
                        column: x => x.Extra_id,
                        principalTable: "Extras",
                        principalColumn: "Id_extra",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DetalleExtra_Extra_id",
                table: "DetalleExtra",
                column: "Extra_id");

            migrationBuilder.CreateIndex(
                name: "IX_DetallesPedido_Pedido_id",
                table: "DetallesPedido",
                column: "Pedido_id");

            migrationBuilder.CreateIndex(
                name: "IX_DetallesPedido_Producto_id",
                table: "DetallesPedido",
                column: "Producto_id");

            migrationBuilder.CreateIndex(
                name: "IX_Pedidos_Cliente_id",
                table: "Pedidos",
                column: "Cliente_id");

            migrationBuilder.CreateIndex(
                name: "IX_ProductopPromocion_Promocion_id",
                table: "ProductopPromocion",
                column: "Promocion_id");

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_Empleado_id",
                table: "Ventas",
                column: "Empleado_id");

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_Pedido_id",
                table: "Ventas",
                column: "Pedido_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bebida");

            migrationBuilder.DropTable(
                name: "Comida");

            migrationBuilder.DropTable(
                name: "DetalleExtra");

            migrationBuilder.DropTable(
                name: "ProductopPromocion");

            migrationBuilder.DropTable(
                name: "Ventas");

            migrationBuilder.DropTable(
                name: "DetallesPedido");

            migrationBuilder.DropTable(
                name: "Extras");

            migrationBuilder.DropTable(
                name: "Promociones");

            migrationBuilder.DropTable(
                name: "Empleado");

            migrationBuilder.DropTable(
                name: "Pedidos");

            migrationBuilder.DropTable(
                name: "Producto");

            migrationBuilder.DropTable(
                name: "Cliente");
        }
    }
}
