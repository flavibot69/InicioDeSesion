const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { correo, password } = req.body;
    try {
        const [exists] = await db.query('SELECT * FROM users WHERE correo = ?', [correo]);
        if (exists.length > 0) return res.status(400).json({ message: 'El correo ya existe' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query('INSERT INTO users (correo, password) VALUES (?, ?)', [correo, hashedPassword]);
        
        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { correo, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE correo = ?', [correo]);
        if (users.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id, correo: user.correo }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, correo: user.correo } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};