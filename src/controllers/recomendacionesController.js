const { PythonShell } = require('python-shell');
const path = require('path');
const { Op } = require('sequelize');
const Producto = require('../models/Producto');

const scriptPath = path.join(__dirname, '..', '..', 'data_science');

async function ejecutarPython(productoId) {
    const options = {
        mode: 'text',
        pythonPath: 'python',
        pythonOptions: ['-u'],
        scriptPath,
        args: [productoId],
        env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        timeout: 30000,
    };

    const results = await PythonShell.run('modelo_recomendaciones.py', options);
    if (!results || results.length === 0) {
        throw new Error('El script Python no retornó ningún resultado');
    }
    return JSON.parse(results[0]);
}

const getRecomendaciones = async (req, res) => {
    const { productoId } = req.params;
    const id = parseInt(productoId, 10);

    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: 'productoId debe ser un número entero positivo' });
    }

    try {
        const data = await ejecutarPython(id);
        if (data.error) {
            return res.status(404).json(data);
        }
        return res.status(200).json(data);
    } catch (err) {
        console.error('❌ Error al ejecutar modelo de recomendaciones:', err);
        return res.status(500).json({ error: 'Error interno al generar recomendaciones' });
    }
};

const getRecomendacionesPorNombre = async (req, res) => {
    const { nombre } = req.query;

    if (!nombre || nombre.trim() === '') {
        return res.status(400).json({ error: 'El parámetro nombre es requerido' });
    }

    try {
        const producto = await Producto.findOne({
            where: { nombre: { [Op.iLike]: `%${nombre.trim()}%` } },
        });
        if (!producto) {
            return res.status(404).json({ error: `Producto "${nombre}" no encontrado`, productoId: null });
        }

        const data = await ejecutarPython(producto.id);
        if (data.error) {
            return res.status(404).json(data);
        }
        return res.status(200).json(data);
    } catch (err) {
        console.error('❌ Error al ejecutar modelo de recomendaciones:', err);
        return res.status(500).json({ error: 'Error interno al generar recomendaciones' });
    }
};

const getPrediccionDemanda = async (req, res) => {
    try {
        const args = req.params.productoId ? [req.params.productoId] : [];
        const options = {
            mode: 'text',
            pythonPath: 'python',
            pythonOptions: ['-u'],
            scriptPath,
            args,
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
            timeout: 30000,
        };
        const results = await PythonShell.run('prediccion_demanda.py', options);
        if (!results || results.length === 0) {
            throw new Error('El script Python no retornó ningún resultado');
        }
        const data = JSON.parse(results[0]);
        if (data.error) {
            return res.status(500).json(data);
        }
        return res.status(200).json(data);
    } catch (err) {
        console.error('❌ Error al ejecutar predicción de demanda:', err);
        return res.status(500).json({ error: 'Error interno al generar predicción de demanda' });
    }
};

module.exports = { getRecomendaciones, getRecomendacionesPorNombre, getPrediccionDemanda };
