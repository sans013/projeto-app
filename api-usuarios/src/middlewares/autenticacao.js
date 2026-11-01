const jwt = require('jsonwebtoken')
const { responderNaoAutorizado } = require('../utils/respostas')

const verificarToken = (req, res, next) => {
    const cabecalhoAuth = req.headers.authorization

    if (!cabecalhoAuth) {
        return responderNaoAutorizado(res, 'Token não fornecido')
    }

    const partes = cabecalhoAuth.split(' ')

    if (partes.length !== 2 || partes[0] !== 'Bearer' || !partes[1]) {
        return responderNaoAutorizado(res, 'Formato de token inválido. Use: Bearer <token>')
    }

    const token = partes[1]

    try {
        const decodificado = jwt.verify(token, process.env.JWT_SECRET)
        req.usuarioLogado = decodificado
        return next()
    } catch (error) {
        return responderNaoAutorizado(res, 'Token inválido ou expirado')
    }
}

module.exports = verificarToken