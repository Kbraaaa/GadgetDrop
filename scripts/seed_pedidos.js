require('dotenv').config();
const sequelize = require('../src/config/db');
const Producto = require('../src/models/Producto');
const Pedido = require('../src/models/Pedido');
const DetallePedido = require('../src/models/DetallePedido');

// ── Patrones de compra con peso ponderado ─────────────────────────────────────

const patrones = [
    // Gaming
    { productos: [6, 12, 4],     peso: 15 },
    { productos: [9, 6, 4],      peso: 12 },
    { productos: [22, 29],       peso: 10 },
    { productos: [9, 30],        peso:  8 },
    { productos: [4, 12, 22],    peso:  8 },
    // Workstation
    { productos: [11, 31, 13],   peso: 12 },
    { productos: [28, 34, 13],   peso: 10 },
    { productos: [17, 13, 33],   peso:  8 },
    { productos: [30, 31, 11],   peso:  7 },
    // Creadores de contenido
    { productos: [14, 2, 8],     peso: 12 },
    { productos: [36, 2, 34],    peso: 10 },
    { productos: [14, 36, 8],    peso:  8 },
    { productos: [28, 2, 36],    peso:  7 },
    // Accesorios móviles
    { productos: [7, 32, 3],     peso: 10 },
    { productos: [16, 7, 33],    peso:  8 },
    { productos: [3, 32],        peso:  8 },
    // Wearables
    { productos: [15, 35],       peso: 10 },
    { productos: [15, 7],        peso:  8 },
    { productos: [35, 32],       peso:  6 },
    // Combos cruzados
    { productos: [9, 6, 4, 13],  peso:  6 },
    { productos: [11, 28, 34],   peso:  5 },
    { productos: [14, 2, 36, 8], peso:  5 },
];

// ── Usuarios por segmento ────────────────────────────────────────────────────

const todosLosUsuarios = [
    // Frecuentes
    { id: 1,  pedidos: 9  },
    { id: 3,  pedidos: 10 },
    { id: 4,  pedidos: 8  },
    { id: 8,  pedidos: 9  },
    { id: 9,  pedidos: 8  },
    { id: 16, pedidos: 8  },
    { id: 23, pedidos: 9  },
    { id: 27, pedidos: 10 },
    // Medios
    { id: 2,  pedidos: 4 },
    { id: 5,  pedidos: 3 },
    { id: 6,  pedidos: 5 },
    { id: 12, pedidos: 4 },
    { id: 13, pedidos: 3 },
    { id: 18, pedidos: 4 },
    { id: 20, pedidos: 5 },
    { id: 21, pedidos: 3 },
    // Esporádicos
    { id: 7,  pedidos: 2 },
    { id: 10, pedidos: 1 },
    { id: 11, pedidos: 2 },
    { id: 14, pedidos: 1 },
    { id: 15, pedidos: 2 },
    { id: 19, pedidos: 1 },
    { id: 28, pedidos: 2 },
    { id: 29, pedidos: 1 },
];

// ── Distribuciones de estado ─────────────────────────────────────────────────

const estadosDistribucion = [
    { estado: 'entregado', peso: 60 },
    { estado: 'enviado',   peso: 20 },
    { estado: 'pendiente', peso: 15 },
    { estado: 'cancelado', peso:  5 },
];

// ── Utilidades ───────────────────────────────────────────────────────────────

function seleccionarPonderado(items) {
    const total = items.reduce((s, i) => s + i.peso, 0);
    let r = Math.random() * total;
    for (const item of items) {
        r -= item.peso;
        if (r <= 0) return item;
    }
    return items[items.length - 1];
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Distribución sesgada hacia fechas recientes (raíz cuadrada del número aleatorio)
function randomFechaReciente() {
    const ahora = Date.now();
    const hace6meses = ahora - 180 * 24 * 60 * 60 * 1000;
    const rango = ahora - hace6meses;
    const t = Math.pow(Math.random(), 0.6); // sesgo hacia fechas recientes
    return new Date(hace6meses + t * rango);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
    await sequelize.sync({ alter: true });

    // Cargar todos los productos válidos desde BD
    const productosDB = await Producto.findAll({ attributes: ['id', 'precio'] });
    const precioMap = new Map(productosDB.map(p => [p.id, parseFloat(p.precio)]));
    const idsValidos = [...precioMap.keys()];

    let totalPedidos = 0;
    let totalDetalles = 0;
    const conteoEstados = { entregado: 0, enviado: 0, pendiente: 0, cancelado: 0 };
    const conteoProdId = new Map();
    const fechasGeneradas = [];

    for (const { id: usuarioId, pedidos: numPedidos } of todosLosUsuarios) {
        for (let i = 0; i < numPedidos; i++) {
            const t = await sequelize.transaction();
            try {
                // 1. Selección de patrón ponderado
                const patron = seleccionarPonderado(patrones);
                const idsSeleccionados = new Set(patron.productos.filter(id => precioMap.has(id)));

                // 2. Producto extra (30% de probabilidad)
                if (Math.random() < 0.3) {
                    const candidatos = idsValidos.filter(id => !idsSeleccionados.has(id));
                    if (candidatos.length > 0) {
                        idsSeleccionados.add(candidatos[randomInt(0, candidatos.length - 1)]);
                    }
                }

                if (idsSeleccionados.size === 0) {
                    await t.rollback();
                    continue;
                }

                // 3–5. Construir detalles con cantidad y precio real
                const detalles = [];
                let total = 0;
                for (const productoId of idsSeleccionados) {
                    const precioUnitario = precioMap.get(productoId);
                    const maxCantidad = precioUnitario > 100 ? 1 : 3;
                    const cantidad = randomInt(1, maxCantidad);
                    total += cantidad * precioUnitario;
                    detalles.push({ productoId, cantidad, precioUnitario });
                    conteoProdId.set(productoId, (conteoProdId.get(productoId) ?? 0) + cantidad);
                }
                total = Math.round(total * 100) / 100;

                // 6. Estado ponderado
                const { estado } = seleccionarPonderado(estadosDistribucion);

                // 7. Fecha aleatoria sesgada hacia reciente
                const fecha = randomFechaReciente();
                fechasGeneradas.push(fecha);

                // Crear pedido dentro de transacción
                const pedido = await Pedido.create(
                    { usuarioId, estado, total, externalId: null, createdAt: fecha, updatedAt: fecha },
                    { transaction: t }
                );

                for (const d of detalles) {
                    await DetallePedido.create(
                        { pedidoId: pedido.id, ...d, createdAt: fecha, updatedAt: fecha },
                        { transaction: t }
                    );
                }

                await t.commit();
                totalPedidos++;
                totalDetalles += detalles.length;
                conteoEstados[estado]++;

            } catch (err) {
                await t.rollback();
                console.error(`  ⚠ Error en pedido para usuario ${usuarioId}:`, err.message);
            }
        }
    }

    // ── Reporte final ─────────────────────────────────────────────────────────

    fechasGeneradas.sort((a, b) => a - b);
    const fechaMin = fechasGeneradas[0]?.toISOString().slice(0, 10) ?? '-';
    const fechaMax = fechasGeneradas[fechasGeneradas.length - 1]?.toISOString().slice(0, 10) ?? '-';

    // Top 5 productos más pedidos
    const top5 = [...conteoProdId.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Cargar nombres para el top 5
    const top5Ids = top5.map(([id]) => id);
    const top5Productos = await Producto.findAll({
        where: { id: top5Ids },
        attributes: ['id', 'nombre'],
    });
    const nombreMap = new Map(top5Productos.map(p => [p.id, p.nombre]));

    console.log('\n========== REPORTE SEED PEDIDOS ==========');
    console.log(`Total de pedidos creados  : ${totalPedidos}`);
    console.log(`Total de detalles creados : ${totalDetalles}`);
    console.log('\n--- Pedidos por estado ---');
    for (const [estado, count] of Object.entries(conteoEstados)) {
        console.log(`  ${estado.padEnd(12)}: ${count}`);
    }
    console.log('\n--- Top 5 productos más pedidos ---');
    for (const [id, qty] of top5) {
        console.log(`  [${String(id).padStart(3)}] ${(nombreMap.get(id) ?? '?').padEnd(35)} : ${qty} unidades`);
    }
    console.log(`\n--- Rango de fechas generado ---`);
    console.log(`  ${fechaMin}  →  ${fechaMax}`);
    console.log('==========================================\n');

    process.exit(0);
}

run().catch(err => {
    console.error('Error al ejecutar seed_pedidos:', err);
    process.exit(1);
});
