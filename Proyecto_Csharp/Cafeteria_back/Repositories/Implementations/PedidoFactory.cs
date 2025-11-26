using Cafeteria_back.Entities.Pedidos;

namespace Cafeteria_back.Repositories.Implementations
{
    public abstract class PedidoFactory
    {
        public abstract Pedido CrearPedido(Pedido pedidoBase);
    }

    public class PedidoDeliveryFactory : PedidoFactory
    {
        public override Pedido CrearPedido(Pedido pedidoBase)
        {
            pedidoBase.Tipo_Entrega = Tipo_entrega.Delivery;
            pedidoBase.estado = Estado_pedido.Preparando;
            return pedidoBase;
        }
    }

    public class PedidoPresencialFactory : PedidoFactory
    {
        public override Pedido CrearPedido(Pedido pedidoBase)
        {
            pedidoBase.Tipo_Entrega = Tipo_entrega.Mesa;
            pedidoBase.estado = Estado_pedido.Preparando;
            return pedidoBase;
        }
    }

    public class PedidoLlevarFactory : PedidoFactory
    {
        public override Pedido CrearPedido(Pedido pedidoBase)
        {
            pedidoBase.Tipo_Entrega = Tipo_entrega.Llevar;
            pedidoBase.estado = Estado_pedido.Preparando;
            return pedidoBase;
        }
    }

}
