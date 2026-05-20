import toast from 'react-hot-toast';
import { buscarClientePorNIT as buscarClienteApi, actualizarApellidoPorNIT } from '@/src/features/cajero/api/Cajerro';
import { obtenerCarrito, asignarCarritoACliente } from '@/src/features/menu/api/Carrito';

interface ClientSearchModalProps {
  mostrarModalNIT: boolean;
  setMostrarModalNIT: (show: boolean) => void;
  nitInput: string;
  setNitInput: (nit: string) => void;
  clienteNit: any | null;
  setClienteNit: (cliente: any | null) => void;
  clienteNoEncontrado: boolean;
  setClienteNoEncontrado: (noEncontrado: boolean) => void;
  apellidoManual: string;
  setApellidoManual: (apellido: string) => void;
  registrarClienteManual: (sinNit?: boolean) => Promise<void>;
  buscarClientePorNIT: () => Promise<void>;
  setCliente: (cliente: any | null) => void;
}

export function ClientSearchModal({
  mostrarModalNIT,
  setMostrarModalNIT,
  nitInput,
  setNitInput,
  clienteNit,
  setClienteNit,
  clienteNoEncontrado,
  setClienteNoEncontrado,
  apellidoManual,
  setApellidoManual,
  registrarClienteManual,
  buscarClientePorNIT,
  setCliente
}: ClientSearchModalProps) {
  
  if (!mostrarModalNIT) return null;

  const handleConfirmarNIT = async () => {
    try {
      if (!clienteNit?.id) return;
      if (!clienteNit.apell_paterno.trim()) {
        toast.error("Debe ingresar un apellido válido");
        return;
      }

      await actualizarApellidoPorNIT(clienteNit.nit, clienteNit.apell_paterno);

      const carrito = await obtenerCarrito();
      if (carrito?.id) {
        await asignarCarritoACliente(carrito.id, clienteNit.id);
      }

      setCliente(clienteNit);
      toast.success("Cliente confirmado y carrito asignado.");
      setMostrarModalNIT(false);
      setClienteNoEncontrado(false);
    } catch (error) {
      console.error("Error al asignar el carrito al cliente:", error);
      toast.error("No se pudo asignar el carrito al cliente.");
    }
  };

  const usarClienteLocal = async () => {
    try {
      const nit = '7777777';
      const cliente = await buscarClienteApi(nit);

      if (!cliente?.id) {
        toast.error("No se pudo obtener cliente o carrito");
        return;
      }

      const carrito = await obtenerCarrito();
      if (carrito?.id) {
        await asignarCarritoACliente(carrito.id, cliente.id);
      }

      setCliente(cliente);
      toast.success("Cliente LOCAL asignado correctamente");
      setMostrarModalNIT(false);
      setClienteNoEncontrado(false);
    } catch (error) {
      console.error("Error al asignar cliente LOCAL:", error);
      toast.error("No se pudo asignar el cliente LOCAL");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg text-gray-800 w-80">
        <h3 className="text-lg font-bold mb-3">Buscar cliente por NIT</h3>

        <label className="text-sm font-medium block mb-1">NIT:</label>
        <div className="flex items-center space-x-2 mb-3">
          <input
            type="number"
            value={nitInput}
            onChange={(e) => setNitInput(e.target.value)}
            readOnly={!!clienteNit}
            className={`flex-1 px-3 py-1.5 border rounded bg-${clienteNit ? 'gray-100' : 'white'} border-gray-300`}
          />
          {clienteNit && (
            <button
              onClick={() => {
                setClienteNit(null);
                setClienteNoEncontrado(false);
              }}
              className="text-sm text-blue-600 hover:underline"
            >
              Editar
            </button>
          )}
        </div>

        {clienteNit ? (
          <>
            <label className="text-sm font-medium block mb-1 mt-2">Apellido Paterno:</label>
            <input
              type="text"
              value={clienteNit.apell_paterno}
              onChange={(e) =>
                setClienteNit({ ...clienteNit, apell_paterno: e.target.value })
              }
              className="w-full px-3 py-1.5 border border-gray-300 rounded mb-3"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setMostrarModalNIT(false)}
                className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarNIT}
                className="px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirmar
              </button>
            </div>
          </>
        ) : !clienteNoEncontrado ? (
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setMostrarModalNIT(false)}
              className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={buscarClientePorNIT}
              className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Buscar
            </button>
            <button
              onClick={usarClienteLocal}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-1.5 rounded"
            >
              Usar Cliente LOCAL
            </button>
          </div>
        ) : (
          <>
            <label className="text-sm font-medium block mb-1 mt-3">No se encontro su NIT, por favor registrese con un apellido</label>
            <label className="text-sm font-medium block mb-1 mt-3">Apellido Paterno:</label>
            <input
              type="text"
              value={apellidoManual}
              onChange={(e) => setApellidoManual(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded mb-3"
            />

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => registrarClienteManual(false)}
                className="w-full bg-[#543F1D] hover:bg-amber-700 text-white py-1.5 rounded"
              >
                Registrar con este NIT
              </button>
              <button
                onClick={() => {
                  setClienteNit(null);
                  setClienteNoEncontrado(false);
                }}
                className="w-full bg-[#FE9A00] hover:bg-amber-700 text-white py-1.5 rounded"
              >
                Editar
              </button>
              <button
                onClick={() => setMostrarModalNIT(false)}
                className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
