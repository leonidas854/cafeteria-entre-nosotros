using Cafeteria_back.Entities.Extras;
using Cafeteria_back.Entities.Productos;
using Cafeteria_back.Repositories.Interfaces;

namespace Cafeteria_back.Repositories.Implementations
{
    public abstract class ExtraDecorador : IProducto
    {
        protected IProducto _producto;
        protected Extra _extra;

        protected ExtraDecorador(IProducto producto, Extra extra)
        {
            _producto = producto;
            _extra = extra;
        }

        public virtual string Nombre() => $"{_producto.Nombre()} + {_extra.Name}";
        public virtual float Precio() => _producto.Precio() + _extra.Precio;
        public virtual string Categoria() => _producto.Categoria();

        public virtual bool ValidarEsCafe() => _producto.Categoria().ToLower() == "café";
    }
}
