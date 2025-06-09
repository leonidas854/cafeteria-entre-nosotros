import { useState } from 'react';

interface TipoPagoProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSelect: (metodo: string) => void;
}

export default function TipoPago({ isOpen, onClose, onPaymentSelect }: TipoPagoProps) {
  const [metodoPago, setMetodoPago] = useState('');
  const [tarjeta, setTarjeta] = useState('');
  const [tarjetaValida, setTarjetaValida] = useState(true);

  const validarTarjeta = (numero: string) => {
    return numero.length === 16 && /^\d+$/.test(numero);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-black rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Seleccionar método de pago</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>

        <div className="space-y-3">
          {["Tarjeta de crédito/débito", "Transferencia bancaria", "Generar QR"].map((label, idx) => (
            <label key={idx} className="flex items-center space-x-3">
              <input
                type="radio"
                name="payment"
                value={label}
                checked={metodoPago === label}
                onChange={() => {
                  setMetodoPago(label);
                  setTarjeta('');
                  setTarjetaValida(true);
                }}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>

        {/* Campos condicionales */}
        <div className="mt-4 space-y-2">
          {metodoPago === "Tarjeta de crédito/débito" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de tarjeta</label>
              <input
                type="text"
                value={tarjeta}
                onChange={(e) => {
                  const val = e.target.value;
                  setTarjeta(val);
                  setTarjetaValida(validarTarjeta(val));
                }}
                maxLength={16}
                className={`mt-1 block w-full border rounded-md px-3 py-2 ${
                  tarjetaValida ? 'border-gray-300' : 'border-red-500'
                }`}
                placeholder="Ej: 1234567812345678"
              />
              {!tarjetaValida && (
                <p className="text-red-500 text-sm mt-1">Tarjeta inválida (deben ser 16 dígitos)</p>
              )}
            </div>
          )}

          {metodoPago === "Transferencia bancaria" && (
            <div>
              <p className="text-gray-700">Banco: Banco Union</p>
              <p className="text-gray-700">
                Cuenta N°: <strong>1234567890123456</strong>
              </p>
            </div>
          )}

          {metodoPago === "Generar QR" && (
            <div className="bg-white p-4 inline-block rounded shadow-md">
              <img src="/shonow.jpg" alt="Código QR" className="mx-auto w-32 h-32" />
              <p className="text-center mt-2 text-sm text-gray-900">Escanea para pagar</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (metodoPago === "Tarjeta de crédito/débito" && !tarjetaValida) return;
              onPaymentSelect(metodoPago);
              onClose();
            }}
            disabled={!metodoPago || (metodoPago === "Tarjeta de crédito/débito" && !tarjetaValida)}
            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}