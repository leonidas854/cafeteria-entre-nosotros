using Cafeteria_back.Repositories.Interfaces;

namespace Cafeteria_back.Repositories.Implementations
{
    public class DescuentoStrategyContext
    {
        private readonly Dictionary<string, IDescuentoStrategy> _estrategias;

        public DescuentoStrategyContext()
        {
            _estrategias = new Dictionary<string, IDescuentoStrategy>(StringComparer.OrdinalIgnoreCase)
        {
            { "porcentaje", new DescuentoPorcentajeStrategy() }
         
        };
        }

        public float AplicarDescuento(string strategyKey, float precioBase, float valorDescuento)
        {
            if (_estrategias.TryGetValue(strategyKey, out var estrategia))
            {
                return estrategia.Aplicar(precioBase, valorDescuento);
            }

            return 0f;
        }
    }

}
