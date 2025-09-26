const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Buscamos el token en el header 'Authorization'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extraemos el token del header (formato: "Bearer TOKEN")
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificamos que el token sea válido usando nuestra clave secreta
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Si es válido, añadimos los datos del usuario (id, rol) a la petición
            req.user = decoded;
            next(); // Pasamos al siguiente paso (el controlador de la ruta)

        } catch (error) {
            console.error('Error de token:', error.message);
            res.status(401).json({ message: 'No autorizado, token inválido.' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'No autorizado, no se encontró token.' });
    }
};

module.exports = { protect };