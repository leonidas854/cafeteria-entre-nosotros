using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cafeteria_back.Migrations
{
    /// <inheritdoc />
    public partial class productoid_v3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resena_Cliente_Cliente_id",
                table: "Resena");

            migrationBuilder.DropForeignKey(
                name: "FK_Resena_Producto_Producto_id",
                table: "Resena");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Resena",
                table: "Resena");

            migrationBuilder.RenameTable(
                name: "Resena",
                newName: "Resenas");

            migrationBuilder.RenameIndex(
                name: "IX_Resena_Producto_id",
                table: "Resenas",
                newName: "IX_Resenas_Producto_id");

            migrationBuilder.RenameIndex(
                name: "IX_Resena_Cliente_id",
                table: "Resenas",
                newName: "IX_Resenas_Cliente_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Resenas",
                table: "Resenas",
                column: "Id_resena");

            migrationBuilder.AddForeignKey(
                name: "FK_Resenas_Cliente_Cliente_id",
                table: "Resenas",
                column: "Cliente_id",
                principalTable: "Cliente",
                principalColumn: "Id_user",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Resenas_Producto_Producto_id",
                table: "Resenas",
                column: "Producto_id",
                principalTable: "Producto",
                principalColumn: "Id_producto",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resenas_Cliente_Cliente_id",
                table: "Resenas");

            migrationBuilder.DropForeignKey(
                name: "FK_Resenas_Producto_Producto_id",
                table: "Resenas");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Resenas",
                table: "Resenas");

            migrationBuilder.RenameTable(
                name: "Resenas",
                newName: "Resena");

            migrationBuilder.RenameIndex(
                name: "IX_Resenas_Producto_id",
                table: "Resena",
                newName: "IX_Resena_Producto_id");

            migrationBuilder.RenameIndex(
                name: "IX_Resenas_Cliente_id",
                table: "Resena",
                newName: "IX_Resena_Cliente_id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Resena",
                table: "Resena",
                column: "Id_resena");

            migrationBuilder.AddForeignKey(
                name: "FK_Resena_Cliente_Cliente_id",
                table: "Resena",
                column: "Cliente_id",
                principalTable: "Cliente",
                principalColumn: "Id_user",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Resena_Producto_Producto_id",
                table: "Resena",
                column: "Producto_id",
                principalTable: "Producto",
                principalColumn: "Id_producto",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
