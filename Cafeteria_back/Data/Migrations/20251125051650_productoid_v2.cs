using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cafeteria_back.Migrations
{
    /// <inheritdoc />
    public partial class productoid_v2 : Migration
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

            migrationBuilder.AlterColumn<long>(
                name: "Producto_id",
                table: "Resena",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Cliente_id",
                table: "Resena",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Resena_Cliente_Cliente_id",
                table: "Resena");

            migrationBuilder.DropForeignKey(
                name: "FK_Resena_Producto_Producto_id",
                table: "Resena");

            migrationBuilder.AlterColumn<long>(
                name: "Producto_id",
                table: "Resena",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<long>(
                name: "Cliente_id",
                table: "Resena",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_Resena_Cliente_Cliente_id",
                table: "Resena",
                column: "Cliente_id",
                principalTable: "Cliente",
                principalColumn: "Id_user");

            migrationBuilder.AddForeignKey(
                name: "FK_Resena_Producto_Producto_id",
                table: "Resena",
                column: "Producto_id",
                principalTable: "Producto",
                principalColumn: "Id_producto");
        }
    }
}
