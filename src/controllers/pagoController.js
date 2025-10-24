const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const crearSesionPago = async (req, res) => {
    const { carrito, usuarioId } = req.body;

    try {
        const line_items = carrito.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.Producto.nombre,
                    images: [
                        item.Producto.imagen.startsWith('http')
                            ? item.Producto.imagen
                            : 'https://via.placeholder.com/300'
                    ],
                },
                unit_amount: Math.round(item.Producto.precio * 100),
            },
            quantity: item.cantidad
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: 'http://localhost:5173/success',
            cancel_url: 'http://localhost:5173/cart',
            metadata: { usuarioId }
        });

        res.json({ url: session.url });

    } catch (err) {
        console.error('❌ Error con Stripe:', err);
        res.status(500).json({ error: 'No se pudo iniciar el pago' });
    }
};

module.exports = { crearSesionPago };