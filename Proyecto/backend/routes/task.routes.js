const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const verifyToken = require('../middleware/auth.middleware');

router.get('/', verifyToken, taskController.getTasks);
router.post('/', verifyToken, taskController.createTask);

module.exports = router;