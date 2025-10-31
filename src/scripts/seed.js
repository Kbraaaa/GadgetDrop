const sequelize = require('../config/db');
const Producto = require('../models/Producto');

/**
 * Seed de ejemplo que inserta productos con imágenes remotas (Picsum).
 * - Solo inserta cuando la tabla está vacía (evita duplicados en ejecuciones repetidas).
 * - Usa URLs de https://picsum.photos con semilla para obtener imágenes reproducibles.
 */
async function insertarProductos() {
    await sequelize.sync(); // Asegura conexión y tablas

    const existe = await Producto.count();
    if (existe > 0) {
        console.log('ℹ️  La tabla productos ya contiene datos. Seed saltado.');
        process.exit();
    }

    const base = size => (seed => `https://picsum.photos/seed/${seed}/${size}/${size}`);

    const productos = [
        {
            nombre: 'Auriculares Gaming RGB',
            descripcion: 'Auriculares con audio surround y micrófono retráctil.',
            precio: 59.99,
            imagen: base(800)('auriculares-gaming'),
            stock: 25
        },
        {
            nombre: 'Mouse Inalámbrico Ergonomico',
            descripcion: 'Mouse con batería de larga duración y sensor preciso.',
            precio: 39.5,
            imagen: base(800)('mouse-ergonomico'),
            stock: 40
        },
        {
            nombre: 'Teclado Mecánico Compacto',
            descripcion: 'Teclado mecánico 60% con switches táctiles.',
            precio: 79.0,
            imagen: base(800)('teclado-mecanico'),
            stock: 15
        },
        {
            nombre: 'Soporte Ajustable para Laptop',
            descripcion: 'Soporte portátil para mejorar la ventilación y la postura.',
            precio: 29.99,
            imagen: base(800)('soporte-laptop'),
            stock: 50
        },
        {
            nombre: 'Cargador USB-C Rápido 65W',
            descripcion: 'Cargador compacto para laptop y móviles con carga rápida.',
            precio: 34.99,
            imagen: base(800)('cargador-usbc'),
            stock: 120
        },
        {
            nombre: 'Banco de Energía 20000mAh',
            descripcion: 'Powerbank con dos puertos y carga rápida.',
            precio: 49.99,
            imagen: base(800)('powerbank-20000'),
            stock: 60
        },
        {
            nombre: 'Soporte para Monitor Doble',
            descripcion: 'Brazo ajustable para dos monitores, mejora ergonomía.',
            precio: 129.99,
            imagen: base(800)('soporte-monitor-doble'),
            stock: 10
        },
        {
            nombre: 'Cámara Web 1080p',
            descripcion: 'Cámara HD con micrófono integrado y lente gran angular.',
            precio: 69.9,
            imagen: base(800)('camara-web-1080p'),
            stock: 33
        },
        {
            nombre: 'Altavoz Bluetooth Portátil',
            descripcion: 'Altavoz con gran autonomía y sonido potente.',
            precio: 45.0,
            imagen: base(800)('altavoz-bluetooth'),
            stock: 80
        },
        {
            nombre: 'Soporte para Teléfono con Carga',
            descripcion: 'Dock 2-en-1 para teléfono con cargador inalámbrico integrado.',
            precio: 24.99,
            imagen: base(800)('dock-carga'),
            stock: 75
        },
        {
            nombre: 'SSD Externo 1TB',
            descripcion: 'Disco externo SSD portátil, altas velocidades de lectura/escritura.',
            precio: 119.99,
            imagen: base(800)('ssd-1tb'),
            stock: 22
        },
        {
            nombre: 'Luz de Anillo para Streaming',
            descripcion: 'Ring light con regulador de intensidad para creadores.',
            precio: 27.5,
            imagen: base(800)('ring-light'),
            stock: 95
        }
    ];

    await Producto.bulkCreate(productos);
    console.log('✅ Productos insertados con éxito (imágenes remotas - Picsum)');

    process.exit();
}

insertarProductos().catch(err => {
    console.error('❌ Error al insertar productos:', err);
    process.exit(1);
});
