namespace Cafeteria_back.Repositories.Interfaces
{
    public interface IProducto
    {
        string Nombre();
        float Precio();
        string Tipo(); 
    }

    public class ProductoBase : IProducto
    {
        public string _nombre;
        public float _precio;
        public string _tipo;

        public ProductoBase(string nombre, float precio, string tipo)
        {
            _nombre = nombre;
            _precio = precio;
            _tipo = tipo;
        }

        public string Nombre() => _nombre;
        public float Precio() => _precio;
        public string Tipo() => _tipo;
    }



}
