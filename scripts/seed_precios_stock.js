require('dotenv').config();
const sequelize = require('../src/config/db');
const Producto = require('../src/models/Producto');

const actualizaciones = [
    { id: 7,  precio: 29.99,  stock: 80  }, // Cable USB-C
    { id: 32, precio: 34.99,  stock: 60  }, // Cargador Inalámbrico
    { id: 16, precio: 14.99,  stock: 70  }, // Estuche Organizador
    { id: 33, precio: 24.99,  stock: 45  }, // Funda Laptop
    { id: 3,  precio: 89.99,  stock: 35  }, // Powerbank
    { id: 2,  precio: 49.99,  stock: 40  }, // Anillo de Luz
    { id: 34, precio: 19.99,  stock: 30  }, // Control Presentaciones
    { id: 14, precio: 74.99,  stock: 20  }, // Micrófono Condensador
    { id: 8,  precio: 54.99,  stock: 30  }, // Trípode
    { id: 12, precio: 19.99,  stock: 50  }, // Alfombrilla RGB
    { id: 29, precio: 79.99,  stock: 30  }, // Audífonos Bluetooth
    { id: 22, precio: 44.99,  stock: 25  }, // Gamepad Bluetooth
    { id: 9,  precio: 169.99, stock: 15  }, // Monitor 24"
    { id: 6,  precio: 189.99, stock: 15  }, // Teclado Mecánico
    { id: 15, precio: 89.99,  stock: 25  }, // Smartwatch
    { id: 17, precio: 24.99,  stock: 45  }, // Enfriador Laptop
    { id: 13, precio: 14.99,  stock: 65  }, // Hub USB
    { id: 31, precio: 34.99,  stock: 35  }, // Lámpara LED
    { id: 11, precio: 199.99, stock: 10  }, // Silla Ergonómica
    { id: 30, precio: 49.99,  stock: 20  }, // Soporte Monitor
    { id: 4,  precio: 64.99,  stock: 40  }, // Mouse Gamer
    { id: 28, precio: 44.99,  stock: 30  }, // Webcam HD
    { id: 35, precio: 45.99,  stock: 35  }, // Banda Deportiva
    { id: 36, precio: 27.99,  stock: 45  }, // Luz Fondo LED
];

async function run() {
    await sequelize.sync({ alter: true });

    let totalActualizados = 0;
    const resultados = [];

    for (const { id, precio, stock } of actualizaciones) {
        const [filas] = await Producto.update({ precio, stock }, { where: { id } });
        if (filas > 0) {
            totalActualizados++;
            const producto = await Producto.findByPk(id, { attributes: ['nombre', 'precio', 'stock'] });
            resultados.push({ id, nombre: producto.nombre, precio, stock });
        } else {
            resultados.push({ id, nombre: '(no encontrado)', precio, stock });
        }
    }

    console.log('\n========== REPORTE PRECIOS Y STOCK ==========');
    console.log(`Total de productos actualizados: ${totalActualizados}`);
    console.log('\n--- Lista de productos actualizados ---');
    for (const r of resultados) {
        const encontrado = r.nombre !== '(no encontrado)';
        const estado = encontrado ? '' : ' ⚠ NO ENCONTRADO';
        console.log(
            `  [${String(r.id).padStart(3)}] ${r.nombre.padEnd(35)} | $${String(r.precio.toFixed(2)).padStart(7)} | stock: ${r.stock}${estado}`
        );
    }
    console.log('==============================================\n');

    process.exit(0);
}

run().catch(err => {
    console.error('Error al ejecutar seed_precios_stock:', err);
    process.exit(1);
});
