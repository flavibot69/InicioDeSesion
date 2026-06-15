const db = require('../config/db');

exports.getTasks = async (req, res) => {
    try {
        const [tasks] = await db.query('SELECT * FROM task WHERE user_id = ?', [req.user.id]);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createTask = async (req, res) => {
    const { titulo } = req.body;
    try {
        await db.query('INSERT INTO task (titulo, user_id) VALUES (?, ?)', [titulo, req.user.id]);
        res.status(201).json({ message: 'Tarea creada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};