import TipoPago from '@/src/shared/components/TipoPago';

interface CheckoutFormProps {
  tipoEntrega: string;
  setTipoEntrega: (tipo: string) => void;
  metodoPagoSeleccionado: string;
  setIsModalOpen: (isOpen: boolean) => void;
  isModalOpen: boolean;
  setMetodoPagoSeleccionado: (metodo: string) => void;
}

export function CheckoutForm({
  tipoEntrega,
  setTipoEntrega,
  metodoPagoSeleccionado,
  setIsModalOpen,
  isModalOpen,
  setMetodoPagoSeleccionado
}: CheckoutFormProps) {
  return (
    <>
      {/* Tipo de entrega */}
      <div className="border-t pt-6 space-y-3 mb-6">
        <h3 className="text-xl font-semibold mb-4">Tipo de entrega</h3>
        {[
          { label: 'Delivery', value: 'Delivery' },
          { label: 'Para Llevar', value: 'Llevar' },
        ].map(({ label, value }) => (
          <label key={value} className="flex items-center space-x-3">
            <input
              type="radio"
              name="entrega"
              value={value}
              checked={tipoEntrega === value}
              onChange={() => setTipoEntrega(value)}
              className="h-4 w-4 text-amber-600 focus:ring-amber-500"
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {/* Método de pago */}
      <div className="border-t pt-6">
        <h3 className="text-xl font-semibold mb-4">Método de pago</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-2 px-4 border border-gray-300 rounded-md text-left hover:bg-gray-50"
        >
          {metodoPagoSeleccionado || "Seleccionar método de pago..."}
        </button>
      </div>

      {/* Modal de tipo de pago */}
      <TipoPago
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPaymentSelect={(metodo: string) => setMetodoPagoSeleccionado(metodo)}
      />
    </>
  );
}
