using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Cafeteria_back.Migrations
{
    /// <inheritdoc />
    public partial class resenas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Cliente_Cliente_id",
                table: "Pedidos");

            migrationBuilder.DropForeignKey(
                name: "FK_Ventas_Empleado_Empleado_id",
                table: "Ventas");

            migrationBuilder.AlterColumn<long>(
                name: "Empleado_id",
                table: "Ventas",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<long>(
                name: "Cliente_id",
                table: "Pedidos",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Empleado",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Cliente",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.CreateTable(
                name: "Resena",
                columns: table => new
                {
                    Id_resena = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    comentario = table.Column<string>(type: "text", nullable: true),
                    puntuacion = table.Column<int>(type: "integer", nullable: false),
                    Fech_resena = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Cliente_id = table.Column<long>(type: "bigint", nullable: true),
                    Producto_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Resena", x => x.Id_resena);
                    table.ForeignKey(
                        name: "FK_Resena_Cliente_Cliente_id",
                        column: x => x.Cliente_id,
                        principalTable: "Cliente",
                        principalColumn: "Id_user");
                    table.ForeignKey(
                        name: "FK_Resena_Producto_Producto_id",
                        column: x => x.Producto_id,
                        principalTable: "Producto",
                        principalColumn: "Id_producto");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Resena_Cliente_id",
                table: "Resena",
                column: "Cliente_id");

            migrationBuilder.CreateIndex(
                name: "IX_Resena_Producto_id",
                table: "Resena",
                column: "Producto_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Cliente_Cliente_id",
                table: "Pedidos",
                column: "Cliente_id",
                principalTable: "Cliente",
                principalColumn: "Id_user");

            migrationBuilder.AddForeignKey(
                name: "FK_Ventas_Empleado_Empleado_id",
                table: "Ventas",
                column: "Empleado_id",
                principalTable: "Empleado",
                principalColumn: "Id_user");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pedidos_Cliente_Cliente_id",
                table: "Pedidos");

            migrationBuilder.DropForeignKey(
                name: "FK_Ventas_Empleado_Empleado_id",
                table: "Ventas");

            migrationBuilder.DropTable(
                name: "Resena");

            migrationBuilder.AlterColumn<long>(
                name: "Empleado_id",
                table: "Ventas",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Cliente_id",
                table: "Pedidos",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Empleado",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Nombre",
                table: "Cliente",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Pedidos_Cliente_Cliente_id",
                table: "Pedidos",
                column: "Cliente_id",
                principalTable: "Cliente",
                principalColumn: "Id_user",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Ventas_Empleado_Empleado_id",
                table: "Ventas",
                column: "Empleado_id",
                principalTable: "Empleado",
                principalColumn: "Id_user",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
