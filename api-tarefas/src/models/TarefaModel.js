const pool = require('../config/database')

const { STATUS_PADRAO } = require('../constants/status')

class TarefaModel {

    static async listarTodas({ limite, offset } = {}) {

        try {

            let query = 'SELECT * FROM todo.tarefas ORDER BY created_at DESC'
            const values = []

            if (limite !== undefined) {
                values.push(limite)
                query += ` LIMIT $${values.length}`
            }
            if (offset !== undefined) {
                values.push(offset)
                query += ` OFFSET $${values.length}`
            }

            const result = await pool.query(query, values)

            return result.rows
        } catch (error) {

            throw new Error(`Erro ao listar todas as tarefas: ${error.message}`)
        }
    }

    static async contarTodas() {
        try {

            const query = 'SELECT COUNT(*) AS total FROM todo.tarefas'
            const result = await pool.query(query)
            return Number(result.rows[0].total)
        } catch (error) {
            throw new Error(`Erro ao contar tarefas: ${error.message}`)
        }
    }

    static async buscarPorId(id) {
        try {

            const query = "SELECT * FROM todo.tarefas WHERE id = $1"

            const result = await pool.query(query, [id])

            return result.rows
        } catch (error) {
            throw new Error(`Erro ao buscar tarefa por ID: ${error.message}`)
        }
    }

    static async criar({ nome, descricao, status = STATUS_PADRAO }) {
        try {

            const query = 'INSERT INTO todo.tarefas (nome, descricao, status) VALUES ($1, $2, $3) RETURNING *'

            const values = [nome, descricao, status];
            const result = await pool.query(query, values);

            return result.rows[0];
        } catch (error) {
            throw new Error(`Erro ao criar tarefa: ${error.message}`)
        }
    }

    static async atualizar(id, dados) {
        try {

            const { nome, descricao, status } = dados;

            const query = `
                UPDATE todo.tarefas
                SET nome = COALESCE($1, nome),
                    descricao = COALESCE($2, descricao),
                    status = COALESCE($3, status),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *
            `

            const values = [nome, descricao, status, id];
            const result = await pool.query(query, values);

            return result.rows[0] || null;
        } catch (error) {
            throw new Error(`Erro ao atualizar tarefa: ${error.message}`)
        }
    }

    static async deletar(id) {
        try {

            const query = "DELETE FROM todo.tarefas WHERE id = $1 RETURNING id"
            const result = await pool.query(query, [id])

            return result.rowCount > 0
        } catch (error) {
            throw new Error(`Erro ao deletar tarefa: ${error.message}`)
        }
    }

    static async buscarPorStatus(status) {
        try {

            const query = 'SELECT * FROM todo.tarefas WHERE status = $1 ORDER BY created_at DESC'
            const result = await pool.query(query, [status])
            return result.rows
        } catch (error) {
            throw new Error(`Erro ao buscar tarefas por status: ${error.message}`)
        }
    }

}

module.exports = TarefaModel;
