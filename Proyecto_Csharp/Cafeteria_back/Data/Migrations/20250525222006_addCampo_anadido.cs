using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Cafeteria_back.Migrations
{
    /// <inheritdoc />
    public partial class addCampo_anadido : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Url_imagen",
                table: "Promociones",
                type: "text",
                nullable: true);

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "Promociones");

            migrationBuilder.DropColumn(
                name: "Descripcion",
                table: "Producto");

            migrationBuilder.RenameColumn(
                name: "Url_imagen",
                table: "Promociones",
                newName: "Nombre_");

            migrationBuilder.RenameColumn(
                name: "Tipo",
                table: "Producto",
                newName: "Nombre_");

            migrationBuilder.AlterColumn<float>(
                name: "Precio",
                table: "Extras",
                type: "real",
                nullable: true,
                oldClrType: typeof(float),
                oldType: "real");

            migrationBuilder.AlterColumn<double>(
                name: "Longitud",
                table: "Cliente",
                type: "double precision",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double precision");

            migrationBuilder.AlterColumn<double>(
                name: "Latitud",
                table: "Cliente",
                type: "double precision",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "double precision");
        }
    }
}
