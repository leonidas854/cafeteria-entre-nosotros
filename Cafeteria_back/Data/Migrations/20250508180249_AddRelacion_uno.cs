using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cafeteria_back.Migrations
{
    /// <inheritdoc />
    public partial class AddRelacion_uno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ventas_Pedido_id",
                table: "Ventas");

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_Pedido_id",
                table: "Ventas",
                column: "Pedido_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Ventas_Pedido_id",
                table: "Ventas");

            migrationBuilder.CreateIndex(
                name: "IX_Ventas_Pedido_id",
                table: "Ventas",
                column: "Pedido_id");
        }
    }
}
