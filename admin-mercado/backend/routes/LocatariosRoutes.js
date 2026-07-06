const express = require('express');
const router = express.Router();
const locatariosController = require('../controllers/locatariosController');

router.get('/', locatariosController.listarLocatarios);
router.post('/', locatariosController.registrarLocatario);
router.put('/:id', locatariosController.editarLocatario);
router.patch('/:id/suspender', locatariosController.suspenderLocatario);

module.exports = router;

// En tu app.js / index.js del backend, monta las rutas así:
// const locatariosRoutes = require('./routes/locatariosRoutes');
// app.use('/api/locatarios', locatariosRoutes);