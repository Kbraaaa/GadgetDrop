
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

export default function Home() {
    const [productos, setProductos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Intentar cargar productos desde el backend. Si la URL cambia en producción,
        // puedes usar una variable de entorno (VITE_API_BASE) y concatenar `/api/productos`.
        fetch('http://localhost:5000/api/productos')
            .then(async res => {
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`HTTP ${res.status} - ${text}`);
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setProductos(data);
                } else {
                    throw new Error('Respuesta no válida del servidor');
                }
            })
            .catch(err => {
                console.error('❌ Error al obtener productos:', err);
                setError(err.message || 'No se pudieron cargar los productos');
            })
            .finally(() => setLoading(false));
    }, []);

    const agregarAlCarrito = async producto => {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        if (!usuario) {
            alert('Debes iniciar sesión para agregar al carrito');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/carrito', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    usuarioId: usuario.id,
                    productoId: producto.id,
                    cantidad: 1,
                }),
            });

            const resultado = await res.json();
            if (!res.ok) throw new Error(resultado.error || 'Error al agregar al carrito');

            alert('Producto agregado al carrito');
        } catch (err) {
            console.error('❌ Error al agregar al carrito:', err);
            alert('Error al agregar al carrito');
        }
    };

    return (
        <>
            <Navbar />
            <header className="bg-gradient-to-r from-blue-600 to-slate-900 text-white py-16 px-6 text-center">
                <h1 className="text-4xl font-extrabold mb-4">Encuentra los gadgets más innovadores</h1>
                <p className="text-lg max-w-xl mx-auto">
                    Explora nuestra selección de productos tecnológicos y descubre lo último en innovación.
                </p>
            </header>

            <section className="p-6 md:p-12">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Productos destacados</h2>

                {error && <p className="text-red-500">{error}</p>}
                {loading && <p className="text-gray-500">Cargando productos...</p>}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {productos.map(prod => (
                        <div
                            key={prod.id}
                            className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center transition transform hover:-translate-y-1 hover:shadow-2xl"
                        >
                            <img
                                src={(
                                    prod && prod.imagen && typeof prod.imagen === 'string' && prod.imagen.startsWith && prod.imagen.startsWith('http')
                                ) ? prod.imagen : 'https://via.placeholder.com/300?text=Sin+imagen'}
                                alt={prod && prod.nombre ? prod.nombre : 'Producto'}
                                className="w-full h-40 object-contain mb-3 rounded"
                            />
                            <p className="text-lg font-semibold text-center text-slate-800">{prod.nombre}</p>
                            <p className="text-sm text-slate-500 text-center mt-1">{prod.descripcion}</p>
                            <p className="text-xl font-bold text-slate-700 mt-2">${Number(prod.precio).toFixed(2)}</p>
                            <button
                                onClick={() => agregarAlCarrito(prod)}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition"
                            >
                                Añadir al carrito
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
