namespace Cafeteria_back.Repositories.Interfaces
{
    public interface IDescuentoStrategy
    {
        float Aplicar(float precioBase, float valor);
    }


    public class DescuentoPorcentajeStrategy : IDescuentoStrategy
    {
        public float Aplicar(float precioBase, float valor)
        {
            
            return precioBase * (valor / 100f);

        }
    }



}
