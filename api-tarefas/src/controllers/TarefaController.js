const TarefaModel = require('../models/TarefaModel')

const {
    STATUS_PADRAO,
    ehStatusValido,
    mensagemStatusInvalido,
} = require('../constants/status')

const {
    responderRequisicaoInvalida,
    responderNaoEncontrado,
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

class TarefaController {

    static async listarTodas(req, res) {
        try {

            const paginacao = interpretarPaginacao(req.query)

            if (paginacao?.erro) {
                return responderRequisicaoInvalida(res, paginacao.erro)
            }

            if (!paginacao) {
                const tarefas = await TarefaModel.listarTodas()
                return res.status(200).json({
                    sucesso: true,
                    quantidade: tarefas.length,
                    dados: tarefas,
                })
            }

            const [tarefas, total] = await Promise.all([
                TarefaModel.listarTodas({
                    limite: paginacao.limite,
                    offset: paginacao.offset,
                }),
                TarefaModel.contarTodas(),
            ])

            return res.status(200).json({
                sucesso: true,
                quantidade: tarefas.length,

                paginacao: {
                    pagina: paginacao.pagina,
                    limite: paginacao.limite,
                    total,

                    totalPaginas: Math.ceil(total / paginacao.limite),
                },
                dados: tarefas,
            })
        } catch (error) {

            return responderErroInterno(res, 'Erro ao listar todas as tarefas', error)
        }
    }

    static async buscarPorId(req, res) {
        try {

            const { id } = req.params

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const tarefa = await TarefaModel.buscarPorId(id)

            if (!tarefa) {
                return responderNaoEncontrado(res, 'Tarefa não encontrada')
            }

            return res.status(200).json({
                sucesso: true,
                dados: tarefa,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao buscar tarefa', error)
        }
    }

    static async criar(req, res) {
        try {

            const { nome, descricao, status } = req.body

            if (!nome || nome.trim() === '') {
                return responderRequisicaoInvalida(res, 'O nome da tarefa é obrigatório')
            }

            if (status && !ehStatusValido(status)) {
                return responderRequisicaoInvalida(res, mensagemStatusInvalido())
            }

            const novaTarefa = await TarefaModel.criar({
                nome: nome.trim(),

                descricao: descricao?.trim() || '',
                status: status || STATUS_PADRAO,
            })

            return res.status(201).json({
                sucesso: true,
                mensagem: 'Tarefa criada com sucesso',
                dados: novaTarefa,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao criar tarefa', error)
        }
    }

    static async atualizar(req, res) {
        try {
            const { id } = req.params
            const { nome, descricao, status } = req.body

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const tarefaExiste = await TarefaModel.buscarPorId(id)
            if (!tarefaExiste) {
                return responderNaoEncontrado(res, 'Tarefa não encontrada')
            }

            if (status && !ehStatusValido(status)) {
                return responderRequisicaoInvalida(res, mensagemStatusInvalido())
            }

            const tarefaAtualizada = await TarefaModel.atualizar(id, {

                nome: nome?.trim(),
                descricao: descricao?.trim(),
                status,
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Tarefa atualizada com sucesso',
                dados: tarefaAtualizada,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao atualizar tarefa', error)
        }
    }

    static async deletar(req, res) {
        try {
            const { id } = req.params

            if (!id || isNaN(id)) {
                return responderRequisicaoInvalida(res, 'ID inválido')
            }

            const deletada = await TarefaModel.deletar(id)

            if (!deletada) {
                return responderNaoEncontrado(res, 'Tarefa não encontrada')
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: 'Tarefa deletada com sucesso',
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao deletar tarefa', error)
        }
    }

    static async buscarPorStatus(req, res) {
        try {

            const { status } = req.params

            if (!ehStatusValido(status)) {
                return responderRequisicaoInvalida(res, mensagemStatusInvalido())
            }

            const tarefas = await TarefaModel.buscarPorStatus(status)

            return res.status(200).json({
                sucesso: true,
                quantidade: tarefas.length,
                dados: tarefas,
            })
        } catch (error) {
            return responderErroInterno(res, 'Erro ao buscar tarefas', error)
        }
    }
}

module.exports = TarefaController
