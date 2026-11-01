const express = require('express')
const TarefaController = require('../controllers/TarefaController')

const router = express.Router()

router.get('/', TarefaController.listarTodas)
router.get('/:id', TarefaController.buscarPorId)
router.post('/', TarefaController.criar)
router.put('/:id', TarefaController.atualizar)
router.delete('/:id', TarefaController.deletar)



module.exports = router