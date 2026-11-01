const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const UsuarioModel = require('../models/UsuarioModel')

const {
    responderRequisicaoInvalida,
    responderNaoAutorizado,
    responderNaoEncontrado,
    responderConflito,
    responderErroInterno,
} = require('../utils/respostas')

const LIMITE_MAXIMO = 100
const LIMITE_PADRAO = 20

const interpretarPaginacao = (query) => {
    const { pagina, limite } = query

    if (pagina === undefined && limite === undefined) return null

    const paginaNumero = pagina === undefined ? 1 : Number(pagina)
    const limiteNumero = limite === undefined ? LIMITE_PADRAO : Number(limite)

    if (!Number.isInteger(paginaNumero) || paginaNumero < 1) {
        return { erro: 'O parâmetro "pagina" deve ser um inteiro maior ou igual a 1' }
    }
    if (!Number.isInteger(limiteNumero) || limiteNumero < 1) {
        return { erro: 'O parâmetro "limite" deve ser um inteiro maior ou igual a 1' }
    }
    if (limiteNumero > LIMITE_MAXIMO) {
        return { erro: `O parâmetro "limite" não pode passar de ${LIMITE_MAXIMO}` }
    }

    return {
        pagina: paginaNumero,
        limite: limiteNumero,
        offset: (paginaNumero - 1) * limiteNumero,
    }
}

class UsuarioController {

    static async criar(req, res) {
        try {
            const { nome, sobrenome, email, usuario, senha, ativo } = req.body

            if (!nome || nome.trim() === '') {
                return responderRequisicaoInvalida(res, 'O campo "nome" é obrigatório')
            }
            if (!sobrenome || sobrenome.trim() === '') {
                return responderRequisicaoInvalida(res, 'O campo "sobrenome" é obrigatório')
            }
            if (!email || email.trim() === '') {
                return responderRequisicaoInvalida(res, 'O campo "email" é obrigatório')
            }
            if (!usuario || usuario.trim() === '') {
                return responderRequisicaoInvalida(res, 'O campo "usuario" é obrigatório')
            }
            if (!senha || String(senha).trim() === '') {
                return responderRequisicaoInvalida(res, 'O campo "senha" é obrigatório')
            }

            const emailLimpo = email.trim().toLowerCase()
            const usuarioLimpo = usuario.trim()

            const [emailExistente, usuarioExistente] = await Promise.all([
                UsuarioModel.buscarPorEmail(emailLimpo),
                UsuarioModel.buscarPorUsuario(usuarioLimpo),
            ])

            if (emailExistente) {
                return responderConflito(res, 'Este e-mail já está cadastrado')
            }
            if (usuarioExistente) {
                return responderConflito(res, 'Este nome de usuário já está em uso')
            }

            const senhaCriptografada = await bcrypt.hash(String(senha), 10)

            const novoUsuario = await UsuarioModel.criar({
                nome: nome.trim(),
                sobrenome: sobrenome.trim(),
                email: emailLimpo,
                usuario: usuarioLimpo,
                senha: senhaCriptografada,
                ativo: ativo !== undefined ? Boolean(ativo) : true,
            })

            return res.status(201).json({
                sucesso: true,
                mensagem: 'Usuário cadastrado com sucesso',
                dados: novoUsuario,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao cadastrar usuário', error)
        }
    }

    static async login(req, res) {
        try {
            const { usuario, email, senha } = req.body
            const identificador = (usuario || email || '').trim()

            if (!identificador || !senha) {
                return responderRequisicaoInvalida(res, 'Informe o usuário (ou e-mail) e a senha')
            }

            let usuarioEncontrado = await UsuarioModel.buscarPorUsuario(identificador)
            if (!usuarioEncontrado) {
                usuarioEncontrado = await UsuarioModel.buscarPorEmail(identificador.toLowerCase())
            }

            if (!usuarioEncontrado) {
                return responderNaoAutorizado(res, 'Credenciais inválidas')
            }

            if (!usuarioEncontrado.ativo) {
                return responderNaoAutorizado(res, 'Usuário inativo')
            }

            const senhaValida = await bcrypt.compare(String(senha), usuarioEncontrado.senha)
            if (!senhaValida) {
                return responderNaoAutorizado(res, 'Credenciais inválidas')
            }

            const token = jwt.sign(
                {
                    id: usuarioEncontrado.id,
                    usuario: usuarioEncontrado.usuario,
                    email: usuarioEncontrado.email,
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            )

            const { senha: _, ...dadosUsuarioSemSenha } = usuarioEncontrado

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Login realizado com sucesso',
                dados: {
                    token,
                    usuario: dadosUsuarioSemSenha,
                },
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao realizar login', error)
        }
    }

    static async listarTodos(req, res) {
        try {
            const paginacao = interpretarPaginacao(req.query)

            if (paginacao?.erro) {
                return responderRequisicaoInvalida(res, paginacao.erro)
            }

            if (!paginacao) {
                const usuarios = await UsuarioModel.listarTodos()
                return res.status(200).json({
                    sucesso: true,
                    mensagem: 'Usuários listados com sucesso',
                    quantidade: usuarios.length,
                    dados: usuarios,
                })
            }

            const [usuarios, total] = await Promise.all([
                UsuarioModel.listarTodos({
                    limite: paginacao.limite,
                    offset: paginacao.offset,
                }),
                UsuarioModel.contarTodos(),
            ])

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Usuários listados com sucesso',
                quantidade: usuarios.length,
                paginacao: {
                    pagina: paginacao.pagina,
                    limite: paginacao.limite,
                    total,
                    totalPaginas: Math.ceil(total / paginacao.limite),
                },
                dados: usuarios,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao listar todos os usuários', error)
        }
    }

    static async buscarPorId(req, res) {
        try {
            const { id } = req.params

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const usuario = await UsuarioModel.buscarPorId(id)

            if (!usuario) {
                return responderNaoEncontrado(res, 'Usuário não encontrado')
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Usuário encontrado com sucesso',
                dados: usuario,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao buscar usuário', error)
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params
            const { nome, sobrenome, email, usuario, senha, ativo } = req.body

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const usuarioExiste = await UsuarioModel.buscarPorId(id)
            if (!usuarioExiste) {
                return responderNaoEncontrado(res, 'Usuário não encontrado')
            }

            const emailLimpo = email?.trim().toLowerCase()
            const usuarioLimpo = usuario?.trim()

            if (emailLimpo && emailLimpo !== usuarioExiste.email) {
                const emailEmUso = await UsuarioModel.buscarPorEmail(emailLimpo)
                if (emailEmUso && Number(emailEmUso.id) !== Number(id)) {
                    return responderConflito(res, 'Este e-mail já está cadastrado para outro usuário')
                }
            }

            if (usuarioLimpo && usuarioLimpo !== usuarioExiste.usuario) {
                const usuarioEmUso = await UsuarioModel.buscarPorUsuario(usuarioLimpo)
                if (usuarioEmUso && Number(usuarioEmUso.id) !== Number(id)) {
                    return responderConflito(res, 'Este nome de usuário já está em uso')
                }
            }

            let senhaCriptografada = undefined
            if (senha !== undefined && String(senha).trim() !== '') {
                senhaCriptografada = await bcrypt.hash(String(senha), 10)
            }

            const usuarioAtualizado = await UsuarioModel.atualizar(id, {
                nome: nome?.trim(),
                sobrenome: sobrenome?.trim(),
                email: emailLimpo,
                usuario: usuarioLimpo,
                senha: senhaCriptografada,
                ativo: ativo !== undefined ? Boolean(ativo) : undefined,
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Usuário atualizado com sucesso',
                dados: usuarioAtualizado,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao atualizar usuário', error)
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const deletado = await UsuarioModel.deletar(id)

            if (!deletado) {
                return responderNaoEncontrado(res, 'Usuário não encontrado')
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Usuário excluído com sucesso',
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao excluir usuário', error)
        }
    }
}

module.exports = UsuarioController