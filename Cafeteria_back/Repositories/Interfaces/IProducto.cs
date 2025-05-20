namespace Cafeteria_back.Repositories.Interfaces
{
    public interface IProducto
    {
        string Nombre();
        float Precio();
        string Categoria(); 
    }

    public class ProductoBase : IProducto
    {
        public string _nombre;
        public float _precio;
        public string _Categoria;

        public ProductoBase(string nombre, float precio, string Categoria)
        {
            _nombre = nombre;
            _precio = precio;
            _Categoria = Categoria;
        }

        public string Nombre() => _nombre;
        public float Precio() => _precio;
        public string Categoria() => _Categoria;
    }



}
