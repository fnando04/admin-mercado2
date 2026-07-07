const express = require('express');
const router = express.Router();
const locatariosController = require('../controllers/locatariosController');

router.get('/', locatariosController.listarLocatarios);
router.post('/', locatariosController.registrarLocatario);
router.put('/:id', locatariosController.editarLocatario);
router.patch('/:id/suspender', locatariosController.suspenderLocatario);

module.exports = router;
