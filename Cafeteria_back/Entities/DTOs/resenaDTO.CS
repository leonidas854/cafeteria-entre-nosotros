using Microsoft.Extensions.Diagnostics.HealthChecks;
using Npgsql.TypeMapping;

namespace Cafeteria_back.Entities.DTOs
{
    public class resenaDTO
    {
        public string? comentario {get;set;}
        public int puntuacion {get;set;}
        //public long Cliente_id{get;set;}
        public long Producto_id{get;set;}


    }



}