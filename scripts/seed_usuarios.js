require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('../src/config/db');
const Usuario = require('../src/models/Usuario');

const actualizaciones = [
    { id: 1,  nombre: 'Carlos Mendoza',    correo: 'cmendoza@gmail.com'     },
    { id: 2,  nombre: 'Diego Ramírez',     correo: 'diegoramirez@gmail.com' },
    { id: 4,  nombre: 'David Rodríguez',   correo: 'drodriguez@gmail.com'   },
    { id: 5,  nombre: 'Valentina Torres',  correo: 'vtorres@gmail.com'      },
    { id: 6,  nombre: 'Pedro Gómez',       correo: 'pgomez@gmail.com'       },
    { id: 7,  nombre: 'Andrés Castillo',   correo: 'acastillo@gmail.com'    },
    { id: 8,  nombre: 'Sebastián Montero', correo: 'smontero@gmail.com'     },
    { id: 9,  nombre: 'Mauricio Sánchez',  correo: 'msanchez@gmail.com'     },
    { id: 10, nombre: 'Felipe Herrera',    correo: 'fherrera@gmail.com'     },
    { id: 12, nombre: 'Daniel Jiménez',    correo: 'djimenez@gmail.com'     },
    { id: 13, nombre: 'Laura Ospina',      correo: 'lospina@gmail.com'      },
    { id: 14, nombre: 'Camila Vargas',     correo: 'cvargas@gmail.com'      },
    { id: 15, nombre: 'Nicolás Mora',      correo: 'nmora@hotmail.com'      },
    { id: 16, nombre: 'Santiago Reyes',    correo: 'sreyes@gmail.com'       },
    { id: 18, nombre: 'Tatiana Ruiz',      correo: 'truiz@gmail.com'        },
    { id: 19, nombre: 'Rubén González',    correo: 'rgonzalez@gmail.com'    },
    { id: 20, nombre: 'Alejandro Cruz',    correo: 'acruz@gmail.com'        },
    { id: 21, nombre: 'Felipe Pinto',      correo: 'fpinto@gmail.com'       },
    { id: 23, nombre: 'Germán Ortiz',                   correo: 'gortiz@gmail.com'     },
    { id: 3,  nombre: 'Juan Diego Portilla Riveros',   correo: 'jportilla@gmail.com'  },
    { id: 11, nombre: 'Juan GadgetDrop',               correo: 'juan@gadgetdrop.com'  },
    { id: 17, nombre: 'Juan Camilo Díaz',              correo: 'jcdiaz@hotmail.com'   },
    { id: 22, nombre: 'Administrador GadgetDrop',      correo: 'admin@gadgetdrop.com' },
    { id: 27, nombre: 'Juan Diego Portilla Riveros',   correo: 'juandiegoportilla84@gmail.com' },
    { id: 28, nombre: 'Andrés Villalba',               correo: 'avillalba@gmail.com'  },
    { id: 29, nombre: 'Melissa Cardona',               correo: 'mcardona@gmail.com'   },
];

const nuevosUsuarios = [
    { nombre: 'Valeria Mendoza',   correo: 'vmendoza@gmail.com'   },
    { nombre: 'Andrés Herrera',    correo: 'aherrera@gmail.com'   },
    { nombre: 'Natalia Ospina',    correo: 'nospina@gmail.com'    },
    { nombre: 'Carlos Jiménez',    correo: 'cjimenez@gmail.com'   },
    { nombre: 'Sofía Ramírez',     correo: 'sofiaram@gmail.com'   },
    { nombre: 'Miguel Torres',     correo: 'mtorres@gmail.com'    },
    { nombre: 'Isabella Cruz',     correo: 'icruz@gmail.com'      },
    { nombre: 'Sebastián Vargas',  correo: 'svargas@gmail.com'    },
    { nombre: 'Daniela Mora',      correo: 'dmora@gmail.com'      },
    { nombre: 'Julián Reyes',      correo: 'jreyes@gmail.com'     },
    { nombre: 'Camilo Gómez',      correo: 'cgomez@gmail.com'     },
    { nombre: 'Manuela Díaz',      correo: 'mdiaz@gmail.com'      },
    { nombre: 'Esteban Castillo',  correo: 'ecastillo@gmail.com'  },
    { nombre: 'Alejandra Ruiz',    correo: 'aruiz@gmail.com'      },
    { nombre: 'Felipe Moreno',     correo: 'fmoreno@gmail.com'    },
    { nombre: 'Mariana Suárez',    correo: 'msuarez@gmail.com'    },
    { nombre: 'David Pineda',      correo: 'dpineda@gmail.com'    },
    { nombre: 'Laura Bermúdez',    correo: 'lbermudez@gmail.com'  },
    { nombre: 'Tomás Guerrero',    correo: 'tguerrero@gmail.com'  },
    // Lote 2 — mayo 2026
    { nombre: 'Gabriela Restrepo', correo: 'grestrepo@gmail.com'  },
    { nombre: 'Nicolás Vargas',    correo: 'nvargas@gmail.com'    },
    { nombre: 'Paola Jiménez',     correo: 'pjimenez@gmail.com'   },
    { nombre: 'Ricardo Mora',      correo: 'rmora@gmail.com'      },
    { nombre: 'Vanessa Torres',    correo: 'vtorres2@gmail.com'   },
    { nombre: 'Andrés Pérez',      correo: 'aperez@gmail.com'     },
    { nombre: 'Catalina López',    correo: 'clopez@gmail.com'     },
    { nombre: 'Hernán Díaz',       correo: 'hdiaz@gmail.com'      },
    { nombre: 'Melissa Ortiz',     correo: 'mortiz@gmail.com'     },
    { nombre: 'Santiago Gómez',    correo: 'sgomez2@gmail.com'    },
    { nombre: 'Andrea Castillo',   correo: 'acastillo2@gmail.com' },
    { nombre: 'Mauricio Herrera',  correo: 'mherrera@gmail.com'   },
    { nombre: 'Lina Suárez',       correo: 'lsuarez@gmail.com'    },
    { nombre: 'Cristian Ruiz',     correo: 'cruiz@gmail.com'      },
    { nombre: 'Alejandro Pineda',  correo: 'apineda@gmail.com'    },
    { nombre: 'Verónica Guerrero', correo: 'vguerrero@gmail.com'  },
    { nombre: 'Javier Bermúdez',   correo: 'jbermudez@gmail.com'  },
    { nombre: 'Tatiana Moreno',    correo: 'tmoreno@gmail.com'    },
    { nombre: 'Sergio Mendoza',    correo: 'smendoza@gmail.com'   },
    { nombre: 'Diana Ospina',      correo: 'dospina@gmail.com'    },
    // Lote 3 — mayo 2026
    { nombre: 'Camila Pedraza',    correo: 'cpedraza@gmail.com'   },
    { nombre: 'Mateo Villamizar',  correo: 'mvillamizar@gmail.com' },
    { nombre: 'Valentina Rojas',   correo: 'vrojas@gmail.com'     },
    { nombre: 'Daniel Cardona',    correo: 'dcardona@gmail.com'   },
    { nombre: 'Sara Montoya',      correo: 'smontoya@gmail.com'   },
    { nombre: 'Jhon Patiño',       correo: 'jpatino@gmail.com'    },
    { nombre: 'María Agudelo',     correo: 'magudelo@gmail.com'   },
    { nombre: 'Luis Calderón',     correo: 'lcalderon@gmail.com'  },
    { nombre: 'Paula Arbeláez',    correo: 'parbelaez@gmail.com'  },
    { nombre: 'Simón Echeverri',   correo: 'secheverri@gmail.com' },
];

async function run() {
    await sequelize.sync({ alter: true });

    let totalActualizados = 0;
    const resultados = [];

    for (const { id, nombre, correo } of actualizaciones) {
        try {
            const [filas] = await Usuario.update({ nombre, correo }, { where: { id } });
            if (filas > 0) {
                totalActualizados++;
                resultados.push({ id, nombre, correo, encontrado: true });
            } else {
                resultados.push({ id, nombre, correo, encontrado: false });
            }
        } catch (e) {
            console.warn(`  [WARN] No se pudo actualizar id=${id} (${correo}): ${e.message}`);
        }
    }

    // Insertar nuevos usuarios si no existen (verificar por correo)
    const saltRounds = 10;
    const contraseñaHash = await bcrypt.hash('Gadget2026*', saltRounds);

    const insertados = [];
    const omitidos = [];

    for (const { nombre, correo } of nuevosUsuarios) {
        const existe = await Usuario.findOne({ where: { correo } });
        if (existe) {
            omitidos.push({ nombre, correo, id: existe.id });
        } else {
            const nuevo = await Usuario.create({
                nombre,
                correo,
                contraseña: contraseñaHash,
                rol: 'cliente',
            });
            insertados.push({ id: nuevo.id, nombre, correo });
        }
    }

    console.log('\n========== REPORTE USUARIOS ==========');
    console.log(`Total de usuarios actualizados: ${totalActualizados}`);

    console.log(`\n--- Nuevos usuarios insertados (${insertados.length}) ---`);
    for (const u of insertados) {
        console.log(
            `  [${String(u.id).padStart(3)}] ${(u.nombre ?? '').padEnd(32)} | ${u.correo}`
        );
    }

    if (omitidos.length > 0) {
        console.log(`\n--- Usuarios ya existentes, omitidos (${omitidos.length}) ---`);
        for (const u of omitidos) {
            console.log(
                `  [${String(u.id).padStart(3)}] ${(u.nombre ?? '').padEnd(32)} | ${u.correo}`
            );
        }
    }

    const todos = await Usuario.findAll({
        attributes: ['id', 'nombre', 'correo'],
        order: [['id', 'ASC']],
    });

    console.log('\n--- Lista completa de usuarios en BD ---');
    for (const u of todos) {
        console.log(
            `  [${String(u.id).padStart(3)}] ${(u.nombre ?? '').padEnd(32)} | ${u.correo}`
        );
    }
    console.log('======================================\n');

    process.exit(0);
}

run().catch(err => {
    console.error('Error al ejecutar seed_usuarios:', err);
    process.exit(1);
});
