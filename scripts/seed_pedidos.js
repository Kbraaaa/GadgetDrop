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
    // Usuarios nuevos IDs 74-83 — 5 pedidos cada uno
    { id: 74, pedidos: 5 },
    { id: 75, pedidos: 5 },
    { id: 76, pedidos: 5 },
    { id: 77, pedidos: 5 },
    { id: 78, pedidos: 5 },
    { id: 79, pedidos: 5 },
    { id: 80, pedidos: 5 },
    { id: 81, pedidos: 5 },
    { id: 82, pedidos: 5 },
    { id: 83, pedidos: 5 },
    // Usuarios esporádicos — 2 pedidos más con fechas antiguas
    { id: 7,  pedidos: 2 },
    { id: 10, pedidos: 2 },
    { id: 11, pedidos: 2 },
    { id: 14, pedidos: 2 },
    { id: 15, pedidos: 2 },
    { id: 19, pedidos: 2 },
    { id: 28, pedidos: 2 },
    { id: 29, pedidos: 2 },
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

// 30% entre 5-6 meses | 35% entre 6-7 meses | 35% entre 7-8 meses
function fechaAleatoria() {
    const ahora = new Date();
    const rand = Math.random();
    let diasAtras;

    if (rand < 0.30) {
        // Entre 5 y 6 meses atrás
        diasAtras = Math.floor(Math.random() * 30) + 150;
    } else if (rand < 0.65) {
        // Entre 6 y 7 meses atrás
        diasAtras = Math.floor(Math.random() * 30) + 180;
    } else {
        // Entre 7 y 8 meses atrás
        diasAtras = Math.floor(Math.random() * 30) + 210;
    }

    const fecha = new Date(ahora);
    fecha.setDate(fecha.getDate() - diasAtras);
    return fecha;
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

                // 7. Fecha con distribución natural (40/35/25 por franjas)
                const fecha = fechaAleatoria();
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

    // Distribución por mes de los pedidos recién creados
    const conteoPorMes = new Map();
    for (const f of fechasGeneradas) {
        const clave = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
        conteoPorMes.set(clave, (conteoPorMes.get(clave) ?? 0) + 1);
    }
    const mesesOrdenados = [...conteoPorMes.entries()].sort(([a], [b]) => a.localeCompare(b));

    console.log('\n--- Distribución por mes (pedidos nuevos) ---');
    for (const [mes, count] of mesesOrdenados) {
        const barra = '█'.repeat(Math.round(count / 2));
        console.log(`  ${mes}  ${String(count).padStart(4)}  ${barra}`);
    }

    const [[{ total: totalPedidosDB }]] = await sequelize.query('SELECT COUNT(*) AS total FROM pedidos');
    const [[{ total: totalDetallesDB }]] = await sequelize.query('SELECT COUNT(*) AS total FROM "detalle_pedidos"');
    console.log('\n--- Totales acumulados en BD ---');
    console.log(`  pedidos        : ${totalPedidosDB}`);
    console.log(`  detalle_pedidos: ${totalDetallesDB}`);

    // Distribución por mes de TODOS los pedidos en BD
    const [todosPedidosDB] = await sequelize.query(
        'SELECT "createdAt" FROM pedidos ORDER BY "createdAt" ASC'
    );
    const conteoPorMesTodo = new Map();
    for (const row of todosPedidosDB) {
        const f = new Date(row.createdAt);
        const clave = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
        conteoPorMesTodo.set(clave, (conteoPorMesTodo.get(clave) ?? 0) + 1);
    }
    const mesesTodoOrdenados = [...conteoPorMesTodo.entries()].sort(([a], [b]) => a.localeCompare(b));
    const maxCount = Math.max(...mesesTodoOrdenados.map(([, c]) => c));

    console.log('\n--- Distribución por mes — TODOS los pedidos en BD ---');
    for (const [mes, count] of mesesTodoOrdenados) {
        const barLen = Math.round((count / maxCount) * 30);
        const barra = '█'.repeat(barLen);
        console.log(`  ${mes}  ${String(count).padStart(4)}  ${barra}`);
    }

    // Productos con historial de 8+ meses (>= 240 días)
    const umbral8meses = new Date();
    umbral8meses.setDate(umbral8meses.getDate() - 240);
    const [prodHistorial] = await sequelize.query(`
        SELECT dp."productoId", MIN(p."createdAt") AS primera_compra
        FROM "detalle_pedidos" dp
        JOIN pedidos p ON p.id = dp."pedidoId"
        GROUP BY dp."productoId"
        HAVING MIN(p."createdAt") <= :umbral
        ORDER BY primera_compra ASC
    `, { replacements: { umbral: umbral8meses.toISOString() } });

    console.log(`\n--- Productos con 8+ meses de historial (${prodHistorial.length}) ---`);
    if (prodHistorial.length > 0) {
        const ids8m = prodHistorial.map(r => r.productoId);
        const prods8m = await Producto.findAll({ where: { id: ids8m }, attributes: ['id', 'nombre'] });
        const nom8m = new Map(prods8m.map(p => [p.id, p.nombre]));
        for (const r of prodHistorial) {
            const fecha8 = new Date(r.primera_compra).toISOString().slice(0, 10);
            console.log(`  [${String(r.productoId).padStart(3)}] ${(nom8m.get(r.productoId) ?? '?').padEnd(35)} primera compra: ${fecha8}`);
        }
    } else {
        console.log('  (ninguno alcanza los 8 meses aún)');
    }

    console.log('==========================================\n');

    process.exit(0);
}

run().catch(err => {
    console.error('Error al ejecutar seed_pedidos:', err);
    process.exit(1);
});
