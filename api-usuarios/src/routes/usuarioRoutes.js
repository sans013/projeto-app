const express = require('express')
const UsuarioController = require('../controllers/UsuarioController')
const verificarToken = require('../middlewares/autenticacao')

const router = express.Router()

// Rotas abertas (públicas)
router.post('/', UsuarioController.criar)
router.post('/login', UsuarioController.login)

// Rotas fechadas (exigem cabeçalho Authorization: Bearer <token>)
router.get('/', verificarToken, UsuarioController.listarTodos)
router.get('/:id', verificarToken, UsuarioController.buscarPorId)
router.put('/:id', verificarToken, UsuarioController.atualizar)
router.delete('/:id', verificarToken, UsuarioController.deletar)

module.exports = router