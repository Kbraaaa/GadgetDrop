import { useEffect, useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import Navbar from '../components/Navbar';
export default function Cart() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
    const token = localStorage.getItem('token');

    const fetchCarrito = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/carrito/${usuario.id}`);
            const data = await res.json();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCarrito();
    }, [usuario.id]);

    const actualizarCantidad = async (id, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;
        try {
            const res = await fetch(`http://localhost:5000/api/carrito/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ cantidad: nuevaCantidad }),
            });
            if (res.ok) fetchCarrito();
        } catch (err) {
            console.error(err);
        }
    };

    const eliminarItem = async id => {
        try {
            const res = await fetch(`http://localhost:5000/api/carrito/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) fetchCarrito();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCheckout = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/pagos/stripe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ carrito: items, usuarioId: usuario.id }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else alert('Error al crear sesión de pago');
        } catch (err) {
            console.error(err);
            alert('Error en el proceso de pago');
        }
    };

    const total = items.reduce((acc, ci) => acc + Number(ci.Producto.precio) * ci.cantidad, 0);

    return (
        <>
            <Navbar />

            <div className="p-6 md:p-10 max-w-5xl mx-auto">
                <h2 className="text-3xl font-bold text-slate-800 mb-8">🛒 Tu Carrito</h2>

                {loading ? (
                    <div className="flex justify-center items-center h-64 text-slate-600 text-lg">
                        <ShoppingCart className="mr-2" /> Cargando tu carrito…
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex justify-center items-center h-64 text-slate-600 text-lg">
                        <ShoppingCart className="mr-2" /> Tu carrito está vacío.
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {items.map(ci => {
                                const prod = ci.Producto;
                                if (!prod) return null;

                                return (
                                    <div
                                        key={ci.id}
                                        className="flex flex-col md:flex-row items-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-lg overflow-hidden p-5 gap-6 hover:shadow-xl transition"
                                    >
                                        <img
                                            src={prod.imagen}
                                            alt={prod.nombre}
                                            className="w-24 h-24 object-cover rounded-xl border"
                                        />
                                        <div className="flex-1 w-full space-y-2">
                                            <h4 className="text-xl font-semibold text-slate-800">{prod.nombre}</h4>
                                            <p className="text-sm text-slate-500">{prod.descripcion}</p>
                                            <p className="text-base text-slate-700 font-medium">
                                                ${Number(prod.precio).toFixed(2)} × {ci.cantidad} ={' '}
                                                <span className="text-blue-600 font-bold">
                                                    ${(prod.precio * ci.cantidad).toFixed(2)}
                                                </span>
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <button
                                                    onClick={() => actualizarCantidad(ci.id, ci.cantidad - 1)}
                                                    className="p-1 bg-slate-200 hover:bg-slate-300 rounded-full"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={ci.cantidad}
                                                    onChange={e =>
                                                        actualizarCantidad(ci.id, parseInt(e.target.value))
                                                    }
                                                    className="w-16 text-center px-2 py-1 border rounded-md"
                                                />
                                                <button
                                                    onClick={() => actualizarCantidad(ci.id, ci.cantidad + 1)}
                                                    className="p-1 bg-slate-200 hover:bg-slate-300 rounded-full"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => eliminarItem(ci.id)}
                                                    className="ml-auto flex items-center gap-1 text-red-600 hover:underline text-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
                            <div className="text-2xl font-bold text-slate-800">
                                Total: <span className="text-blue-600">${total.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white text-lg px-6 py-3 rounded-xl shadow-md transition"
                            >
                                Proceder al pago
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
