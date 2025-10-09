import { useEffect, useState } from 'react';
import { PackageCheck, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function Pedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const usuario = JSON.parse(localStorage.getItem('usuario')) || {};

    useEffect(() => {
        async function cargarPedidos() {
            try {
                const res = await fetch(`http://localhost:5000/api/pedidos/usuario/${usuario.id}`);
                const data = await res.json();
                setPedidos(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        cargarPedidos();
    }, [usuario.id]);

    return (
        <>
            <Navbar />

            <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
                <h2 className="text-3xl font-bold text-slate-800">📦 Mis Pedidos</h2>

                {loading ? (
                    <div className="flex justify-center items-center h-64 text-slate-600 text-lg">
                        <Loader2 className="animate-spin mr-2" /> Cargando tus pedidos…
                    </div>
                ) : pedidos.length === 0 ? (
                    <div className="flex justify-center items-center h-64 text-slate-600 text-lg">
                        <PackageCheck className="mr-2" /> No tienes pedidos aún.
                    </div>
                ) : (
                    pedidos.map(p => (
                        <div
                            key={p.id}
                            className="bg-white rounded-2xl shadow-md p-6 border border-slate-100 transition hover:shadow-lg"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xl font-bold text-blue-700">Pedido #{p.id}</h3>
                                <span
                                    className={`text-sm font-semibold px-3 py-1 rounded-full ${p.estado === 'pagado'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                >
                                    {p.estado}
                                </span>
                            </div>
                            <p className="text-sm text-slate-500 mb-1">
                                Fecha: {new Date(p.createdAt).toLocaleString()}
                            </p>
                            <p className="text-base font-medium text-slate-700 mb-3">
                                Total: <span className="text-blue-600 font-bold">${Number(p.total).toFixed(2)}</span>
                            </p>

                            <ul className="space-y-2 border-t pt-3 text-sm text-slate-700">
                                {p.DetallePedidos.map(dp => (
                                    <li key={dp.id} className="flex justify-between">
                                        <span>
                                            {dp.Producto.nombre} × {dp.cantidad}
                                        </span>
                                        <span>${(dp.precioUnitario * dp.cantidad).toFixed(2)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
