const sequelize = require('../config/db');
const Producto = require('../models/Producto');

async function corregirUrlsImagenes() {
    try {
        await sequelize.sync();

        const productos = await Producto.findAll();

        for (const producto of productos) {
            if (!producto.imagen.startsWith('/img/')) {
                const nuevaImagen = `/img/${producto.imagen}`;
                producto.imagen = nuevaImagen;
                await producto.save();
                console.log(`✅ Imagen corregida para producto ID ${producto.id}`);
            }
        }

        console.log('🟢 Corrección completada.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error corrigiendo imágenes:', error);
        process.exit(1);
    }
}

corregirUrlsImagenes();
