using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Cafeteria_back.Entities.Tablas_intermedias;
using Cafeteria_back.Entities.Usuarios;
using Cafeteria_back.Repositories.Interfaces;

namespace Cafeteria_back.Entities.Pedidos
{
    public class Pedido
    {
        [Key]
        public long Id_pedido { get; set; }


        public long? Cliente_id { get; set; }

        [ForeignKey("Cliente_id")]
        public Cliente? Cliente { get; set; }

        public float? Total_estimado { get; set; }

        public float? Total_descuento { get; set; }

        public Tipo_entrega? Tipo_Entrega { get; set; }

        public Estado_pedido? estado { get; set; }

        public Venta? Venta { get; set; }

        public List<Detalle_pedido>? Detalle_pedido { get; set; }
        private readonly List<IPedidoObserver> _observadores = new();

        public void AgregarObserver(IPedidoObserver observador)
        {
            _observadores.Add(observador);
        }

        public void CambiarEstado(Estado_pedido nuevoEstado)
        {
            estado = nuevoEstado;
            foreach (var obs in _observadores)
            {
                obs.Actualizar(nuevoEstado);
            }
        }


    }
   
    public enum Tipo_entrega
    {
        Mesa,
        Delivery,
        Llevar
    }
    public enum Estado_pedido
    {
        En_espera,
        Preparando,
        Entregado,
        Delivery,
        Listo
    }
}
