// src/scripts/seed.js
const sequelize = require('../config/db');
const Producto = require('../models/Producto');

async function insertarProductos() {
    await sequelize.sync(); // Asegura conexión y tablas

    const productos = [
        {
            nombre: 'Luz LED RGB para Escritorio',
            descripcion: 'Tira LED RGB con control remoto para decorar el escritorio.',
            precio: 12.99,
            imagen: 'https://via.placeholder.com/200?text=Luz+LED',
        },
        {
            nombre: 'Enfriador para Laptop',
            descripcion: 'Base con ventiladores silenciosos para enfriar portátiles.',
            precio: 22.50,
            imagen: 'https://via.placeholder.com/200?text=Enfriador',
        },
    ];

    await Producto.bulkCreate(productos);
    console.log('✅ Productos insertados con éxito');

    process.exit();
}

insertarProductos().catch(err => {
    console.error('❌ Error al insertar productos:', err);
    process.exit(1);
});
