require('dotenv').config();
const sequelize = require('../src/config/db');
const Producto = require('../src/models/Producto');

// Paso 2: Productos existentes a actualizar con su categoría
const categoriasExistentes = [
    { nombre: 'Cable USB-C a USB-C 60W',                   categoria: 'Accesorios Móviles' },
    { nombre: 'Smartwatch Deportivo Serie 8',               categoria: 'Wearables' },
    { nombre: 'Monitor 24"',                                categoria: 'Gaming' },
    { nombre: 'Teclado Mecánico RGB',                       categoria: 'Gaming' },
    { nombre: 'Silla Ergonómica',                           categoria: 'Workstation' },
    { nombre: 'Gamepad Bluetooth para Smartphone',          categoria: 'Gaming' },
    { nombre: 'Mouse Gamer RGB',                            categoria: 'Gaming' },
    { nombre: 'Anillo de Luz LED 26cm',                     categoria: 'Creadores de Contenido' },
    { nombre: 'Alfombrilla RGB',                            categoria: 'Gaming' },
    { nombre: 'Webcam HD',                                  categoria: 'Workstation' },
    { nombre: 'Hub USB 4 Puertos',                          categoria: 'Workstation' },
    { nombre: 'Enfriador para Laptop',                      categoria: 'Workstation' },
    { nombre: 'Micrófono Condensador',                      categoria: 'Creadores de Contenido' },
    { nombre: 'Estuche Organizador para Gadgets',           categoria: 'Accesorios Móviles' },
    { nombre: 'Trípode Ajustable + Soporte de Celular',     categoria: 'Creadores de Contenido' },
    { nombre: 'Powerbank 20,000mAh Carga Rápida',           categoria: 'Accesorios Móviles' },
];

// Paso 3: Productos nuevos a insertar si no existen
const productosNuevos = [
    {
        nombre: 'Audífonos Bluetooth Over-Ear',
        precio: 79.99,
        stock: 25,
        descripcion: 'Audífonos inalámbricos con cancelación de ruido, 30 horas de batería y sonido Hi-Fi.',
        imagen: 'https://placehold.co/300x300?text=Audifonos',
        categoria: 'Gaming',
    },
    {
        nombre: 'Soporte Articulado para Monitor',
        precio: 45.99,
        stock: 20,
        descripcion: 'Soporte de escritorio con brazo articulado para monitores de 13 a 27 pulgadas.',
        imagen: 'https://placehold.co/300x300?text=Soporte+Monitor',
        categoria: 'Workstation',
    },
    {
        nombre: 'Lámpara LED de Escritorio',
        precio: 34.99,
        stock: 30,
        descripcion: 'Lámpara con 3 temperaturas de color, intensidad ajustable y puerto USB de carga.',
        imagen: 'https://placehold.co/300x300?text=Lampara+LED',
        categoria: 'Workstation',
    },
    {
        nombre: 'Cargador Inalámbrico 15W',
        precio: 29.99,
        stock: 40,
        descripcion: 'Cargador inalámbrico Qi compatible con iPhone y Android, carga rápida de 15W.',
        imagen: 'https://placehold.co/300x300?text=Cargador+Inalambrico',
        categoria: 'Accesorios Móviles',
    },
    {
        nombre: 'Funda Rígida para Laptop 15"',
        precio: 24.99,
        stock: 35,
        descripcion: 'Funda resistente al agua con interior acolchado para laptops de hasta 15 pulgadas.',
        imagen: 'https://placehold.co/300x300?text=Funda+Laptop',
        categoria: 'Accesorios Móviles',
    },
    {
        nombre: 'Control Remoto para Presentaciones',
        precio: 19.99,
        stock: 20,
        descripcion: 'Presentador inalámbrico con puntero láser, compatible con PowerPoint y Google Slides.',
        imagen: 'https://placehold.co/300x300?text=Control+Presentaciones',
        categoria: 'Creadores de Contenido',
    },
    {
        nombre: 'Banda Deportiva Inteligente',
        precio: 45.99,
        stock: 30,
        descripcion: 'Pulsera fitness con monitor de frecuencia cardíaca, sueño, calorías y notificaciones. Compatible con Android e iOS.',
        imagen: 'https://placehold.co/300x300?text=Banda+Deportiva',
        categoria: 'Wearables',
    },
    {
        nombre: 'Luz de Fondo LED para Escritorio',
        precio: 27.99,
        stock: 25,
        descripcion: 'Tira LED USB con control remoto, 16 colores y modo música. Ideal para streaming y setup gamer.',
        imagen: 'https://placehold.co/300x300?text=Luz+LED+Escritorio',
        categoria: 'Creadores de Contenido',
    },
];

async function run() {
    await sequelize.sync({ alter: true });

    // Paso 2: actualizar categorías de productos existentes
    let actualizados = 0;
    for (const { nombre, categoria } of categoriasExistentes) {
        const [filas] = await Producto.update({ categoria }, { where: { nombre } });
        if (filas > 0) actualizados += filas;
    }

    // Corrección manual por ID (productos sin categoría tras el paso anterior)
    const correccionesPorId = [
        { id: 4,  categoria: 'Gaming' },      // Mouse Gamer RGB
        { id: 28, categoria: 'Workstation' }, // Webcam HD
    ];
    for (const { id, categoria } of correccionesPorId) {
        const [filas] = await Producto.update({ categoria }, { where: { id } });
        if (filas > 0) actualizados += filas;
    }

    // Paso 3: insertar productos nuevos si no existen
    let insertados = 0;
    for (const datos of productosNuevos) {
        const existe = await Producto.findOne({ where: { nombre: datos.nombre } });
        if (!existe) {
            await Producto.create(datos);
            insertados++;
        }
    }

    // Paso 4: verificación y reporte
    console.log('\n========== REPORTE SEED CATEGORÍAS ==========');
    console.log(`Productos actualizados con categoría : ${actualizados}`);
    console.log(`Productos nuevos insertados          : ${insertados}`);

    const todos = await Producto.findAll({
        attributes: ['id', 'nombre', 'categoria'],
        order: [['categoria', 'ASC'], ['nombre', 'ASC']],
    });

    console.log('\n--- Lista completa de productos con categoría ---');
    for (const p of todos) {
        const cat = p.categoria ?? '(sin categoría)';
        console.log(`  [${String(p.id).padStart(3)}] ${cat.padEnd(25)} | ${p.nombre}`);
    }
    console.log('\n--- Productos por categoría ---');
    const conteo = {};
    for (const p of todos) {
        const cat = p.categoria ?? '(sin categoría)';
        conteo[cat] = (conteo[cat] ?? 0) + 1;
    }
    for (const [cat, total] of Object.entries(conteo).sort()) {
        console.log(`  ${cat.padEnd(25)} : ${total}`);
    }
    console.log('==============================================\n');

    process.exit(0);
}

run().catch(err => {
    console.error('Error al ejecutar seed_categorias:', err);
    process.exit(1);
});
