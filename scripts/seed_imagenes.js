'use strict';

require('dotenv').config();
const sequelize = require('../src/config/db');
const Producto = require('../src/models/Producto');

const imagenes = [
  {
    id: 4,
    nombre: 'Mouse Gamer RGB',
    // Logitech G203 LIGHTSYNC — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/26-197-390-01.jpg',
  },
  {
    id: 6,
    nombre: 'Teclado Mecánico RGB',
    // Redragon KUMARA K552 RGB — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/AKKKS240927090K5BUV.jpg',
  },
  {
    id: 7,
    nombre: 'Cable USB-C a USB-C 60W',
    // Anker USB-C 60W — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/ACCUS210304gkrwe.jpg',
  },
  {
    id: 9,
    nombre: 'Monitor 24"',
    // LG 24MP60G Full HD IPS — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/24-026-191-V01.jpg',
  },
  {
    id: 11,
    nombre: 'Silla Ergonómica',
    // Ergonomic Mesh High-Back — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/AEVHS2601260K5IQQ0A.jpg',
  },
  {
    id: 13,
    nombre: 'Hub USB 4 Puertos',
    // Anker 4-Port USB 3.0 Hub — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/V0XWS200331bt1Rn.jpg',
  },
  {
    id: 14,
    nombre: 'Micrófono Condensador',
    // Logitech Blue Yeti USB Blackout — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/86-847-001-13.jpg',
  },
  {
    id: 16,
    nombre: 'Estuche Organizador para Gadgets',
    // UGREEN Electronics Organizer — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/C1DRS2509300K1SIN5C.jpg',
  },
  {
    id: 22,
    nombre: 'Gamepad Bluetooth para Smartphone',
    // GameSir T3 Wireless Controller — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/B39HS2404030HEP993D.jpg',
  },
  {
    id: 28,
    nombre: 'WebCam HD 1080p',
    // Logitech C920 HD Pro — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/26-104-635-Z01.jpg',
  },
  {
    id: 29,
    nombre: 'Audífonos Bluetooth Over-Ear',
    // Sony WH-1000XM4 — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/ARUXS2109276D223.jpg',
  },
  {
    id: 30,
    nombre: 'Soporte Articulado para Monitor',
    // VIVO Single Monitor Desk Mount — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/V0BWD26012814FC813E.jpg',
  },
  {
    id: 31,
    nombre: 'Lámpara LED de Escritorio',
    // LED Desk Lamp 24W clamp — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/C0NDD2509050BKSV9A9.jpg',
  },
  {
    id: 32,
    nombre: 'Cargador Inalámbrico 15W',
    // Wireless Charger Pad 15W Qi — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/C280S2509200KJZW6EE.jpg',
  },
  {
    id: 33,
    nombre: 'Funda Rígida para Laptop 15"',
    // MOSISO Hard Shell EVA 15.6" — iMosiso Shopify CDN
    url: 'https://imosiso.com/cdn/shop/files/71c3uzhMoqL._AC_SL1500.jpg?v=1754901622&width=1946',
  },
  {
    id: 34,
    nombre: 'Control Remoto para Presentaciones',
    // USB-C Wireless Presentation Clicker — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/AU6SD24070803K9U0C1.jpg',
  },
  {
    id: 35,
    nombre: 'Banda Deportiva Inteligente',
    // Xiaomi Mi Smart Band 10 — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/C5CRD26030912U4Z299.jpg',
  },
  {
    id: 36,
    nombre: 'Luz de Fondo LED para Escritorio',
    // LED Bias Lighting strip 6.6ft RGB — Newegg CDN
    url: 'https://c1.neweggimages.com/productimage/nb640/AMM4S200902ICVwJ.jpg',
  },
];

async function main() {
  await sequelize.authenticate();
  console.log('Conectado a BD\n');

  let ok = 0;
  let notFound = 0;

  for (const { id, nombre, url } of imagenes) {
    const [count] = await Producto.update({ imagen: url }, { where: { id } });
    if (count > 0) {
      console.log(`✅  ID ${String(id).padStart(2)}  ${nombre}`);
      console.log(`    ${url}\n`);
      ok++;
    } else {
      console.log(`⚠️   ID ${String(id).padStart(2)}  ${nombre} → no encontrado en BD\n`);
      notFound++;
    }
  }

  console.log('─'.repeat(60));
  console.log(`Actualizados: ${ok}   No encontrados: ${notFound}`);
  await sequelize.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
