require('dotenv').config();
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

async function run() {
    await sequelize.sync({ alter: true });

    let totalActualizados = 0;
    const resultados = [];

    for (const { id, nombre, correo } of actualizaciones) {
        const [filas] = await Usuario.update({ nombre, correo }, { where: { id } });
        if (filas > 0) {
            totalActualizados++;
            resultados.push({ id, nombre, correo, encontrado: true });
        } else {
            resultados.push({ id, nombre, correo, encontrado: false });
        }
    }

    console.log('\n========== REPORTE USUARIOS ==========');
    console.log(`Total de usuarios actualizados: ${totalActualizados}`);
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
