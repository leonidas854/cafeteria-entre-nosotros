using Cafeteria_back.Entities.Pedidos;

namespace Cafeteria_back.Repositories.Interfaces
{
    public interface IPedidoObserver
    {
        void Actualizar(Estado_pedido estado);
       

        
    }
    public class PantallaTabletBarista : IPedidoObserver
    {
        public void Actualizar(Estado_pedido estado)
        {
            Console.WriteLine($"Barista: El estado del pedido cambió a: {estado}");
        }
    }
}
