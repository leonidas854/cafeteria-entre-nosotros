using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Cafeteria_back.Migrations
{
    /// <inheritdoc />
    public partial class Addarreglar_tablas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CombosProducto");

            migrationBuilder.DropTable(
                name: "PedidoCombos");

            migrationBuilder.DropTable(
                name: "Combos");

            migrationBuilder.AddColumn<string>(
                name: "Categoria",
                table: "Productos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Proporcion",
                table: "Productos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sabores",
                table: "Productos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sub_categoria",
                table: "Productos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Tamanio",
                table: "Productos",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Sabor_elegido",
                table: "DetallesPedido",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Categoria",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "Proporcion",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "Sabores",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "Sub_categoria",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "Tamanio",
                table: "Productos");

            migrationBuilder.DropColumn(
                name: "Sabor_elegido",
                table: "DetallesPedido");

            migrationBuilder.CreateTable(
                name: "Combos",
                columns: table => new
                {
                    Idcombo = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nombre = table.Column<string>(type: "text", nullable: true),
                    Precio_combo = table.Column<float>(type: "real", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Combos", x => x.Idcombo);
                });

            migrationBuilder.CreateTable(
                name: "CombosProducto",
                columns: table => new
                {
                    Combo_id = table.Column<long>(type: "bigint", nullable: false),
                    Producto_id = table.Column<long>(type: "bigint", nullable: false),
                    Cantidad = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CombosProducto", x => new { x.Combo_id, x.Producto_id });
                    table.ForeignKey(
                        name: "FK_CombosProducto_Combos_Combo_id",
                        column: x => x.Combo_id,
                        principalTable: "Combos",
                        principalColumn: "Idcombo",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CombosProducto_Productos_Producto_id",
                        column: x => x.Producto_id,
                        principalTable: "Productos",
                        principalColumn: "Id_producto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PedidoCombos",
                columns: table => new
                {
                    Pedido_id = table.Column<long>(type: "bigint", nullable: false),
                    Combo_id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PedidoCombos", x => new { x.Pedido_id, x.Combo_id });
                    table.ForeignKey(
                        name: "FK_PedidoCombos_Combos_Combo_id",
                        column: x => x.Combo_id,
                        principalTable: "Combos",
                        principalColumn: "Idcombo",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PedidoCombos_Pedidos_Pedido_id",
                        column: x => x.Pedido_id,
                        principalTable: "Pedidos",
                        principalColumn: "Id_pedido",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CombosProducto_Producto_id",
                table: "CombosProducto",
                column: "Producto_id");

            migrationBuilder.CreateIndex(
                name: "IX_PedidoCombos_Combo_id",
                table: "PedidoCombos",
                column: "Combo_id");
        }
    }
}
