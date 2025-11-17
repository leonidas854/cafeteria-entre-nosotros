using Cafeteria_back.Entities.Extras;
using Cafeteria_back.Repositories.Interfaces;

namespace Cafeteria_back.Repositories.Implementations
{
    public class ExtraDecoradorGenerico : ExtraDecorador
    {
        public ExtraDecoradorGenerico(IProducto producto, Extra extra)
        : base(producto, extra)
        {
        }
    }
}
