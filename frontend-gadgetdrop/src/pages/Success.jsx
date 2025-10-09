import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function Success() {
    const navigate = useNavigate();

    useEffect(() => {
        const guardarPedido = async () => {
            const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
            if (!usuario.id) return;

            try {
                const resCarrito = await fetch(`http://localhost:5000/api/carrito/${usuario.id}`);
                const carrito = await resCarrito.json();

                if (!Array.isArray(carrito) || carrito.length === 0) return;

                await fetch('http://localhost:5000/api/pedidos/pagado', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ usuarioId: usuario.id, carrito }),
                });
            } catch (err) {
                console.error("❌ Error al guardar pedido:", err);
            }
        };

        guardarPedido();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-100 to-white px-6">
            <div className="max-w-md w-full bg-white shadow-xl rounded-3xl p-8 text-center">
                <CheckCircle className="mx-auto text-green-600 w-16 h-16 mb-4" />
                <h2 className="text-3xl font-bold text-green-700">¡Pago exitoso!</h2>
                <p className="mt-4 text-slate-600 text-base">
                    Gracias por tu compra. Hemos recibido tu pago correctamente.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                    Te enviaremos una confirmación por correo electrónico.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition"
                    >
                        Volver al inicio
                    </button>
                    <button
                        onClick={() => navigate('/pedidos')}
                        className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-6 rounded-lg transition"
                    >
                        Ver mis pedidos
                    </button>
                </div>
            </div>
        </div>
    );
}
