using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cafeteria_back.Migrations
{
    /// <inheritdoc />
    public partial class actualizado : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resena_Producto_Producto_id",
                table: "Resena");

            migrationBuilder.DropIndex(
                name: "IX_Resena_Producto_id",
                table: "Resena");

            migrationBuilder.DropColumn(
                name: "Producto_id",
                table: "Resena");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "Producto_id",
                table: "Resena",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Resena_Producto_id",
                table: "Resena",
                column: "Producto_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Resena_Producto_Producto_id",
                table: "Resena",
                column: "Producto_id",
                principalTable: "Producto",
                principalColumn: "Id_producto");
        }
    }
}
