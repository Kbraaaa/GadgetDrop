
module.exports = function verificarAdmin(req, res, next) {

    console.log('👤 Usuario desde token:', req.usuario);

    if (req.usuario && req.usuario.rol === 'admin') {
        return next();
    }

    return res.status(403).json({ mensaje: 'Acceso denegado: solo administradores.' });
};
