using AutoMapper;
using Cafeteria_back.Entities.Productos;
using Cafeteria_back.Entities.Promociones;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.DTOs;

namespace Cafeteria_back.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Ejemplo de mapeo entre Entidades y DTOs
            // CreateMap<Producto, ProductoDTO>().ReverseMap();
            // CreateMap<Promocion, PromocionDTO>().ReverseMap();
            // CreateMap<Empleado, EmpleadoDTO>().ReverseMap();
        }
    }
}
