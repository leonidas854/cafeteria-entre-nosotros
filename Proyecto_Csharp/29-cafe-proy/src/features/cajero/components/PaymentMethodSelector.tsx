interface PaymentMethodSelectorProps {
  tipoOrden: 'llevar' | 'mesa';
  setTipoOrden: (tipo: 'llevar' | 'mesa') => void;
  metodoPago: 'tarjeta' | 'qr' | 'efectivo';
  setMetodoPago: (metodo: 'tarjeta' | 'qr' | 'efectivo') => void;
}

export function PaymentMethodSelector({
  tipoOrden,
  setTipoOrden,
  metodoPago,
  setMetodoPago
}: PaymentMethodSelectorProps) {
  return (
    <>
      <div className="mb-3">
        <p className="font-semibold text-sm text-gray-700 mb-1">Tipo de Orden:</p>
        <div className="flex space-x-4">
          {["llevar", "mesa"].map(tipo => (
            <label key={tipo} className="flex items-center space-x-1 text-sm text-gray-600">
              <input
                type="radio"
                name="tipoOrden"
                value={tipo}
                checked={tipoOrden === tipo}
                onChange={() => setTipoOrden(tipo as 'llevar' | 'mesa')}
              />
              <span>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <p className="font-semibold text-sm text-gray-700 mb-1">Método de Pago:</p>
        <div className="flex space-x-4 flex-wrap">
          {["tarjeta", "qr", "efectivo"].map(metodo => (
            <label key={metodo} className="flex items-center space-x-1 text-sm text-gray-600">
              <input
                type="radio"
                name="metodoPago"
                value={metodo}
                checked={metodoPago === metodo}
                onChange={() => setMetodoPago(metodo as 'tarjeta' | 'qr' | 'efectivo')}
              />
              <span>{metodo.charAt(0).toUpperCase() + metodo.slice(1)}</span>
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
