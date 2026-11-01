const pool = require('../config/database')

const COLUNAS_PUBLICAS = `
    id,
    nome,
    sobrenome,
    email,
    usuario,
    ativo,
    data_criacao,
    data_alteracao
`

class UsuarioModel {

    static async listarTodos({ limite, offset } = {}) {
        try {
            let query = `SELECT ${COLUNAS_PUBLICAS} FROM usuarios ORDER BY data_criacao DESC`
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
            throw new Error(`Erro ao listar todos os usuários: ${error.message}`)
        }
    }

    static async contarTodos() {
        try {
            const query = 'SELECT COUNT(*) AS total FROM usuarios'
            const result = await pool.query(query)
            return Number(result.rows[0].total)
        } catch (error) {
            throw new Error(`Erro ao contar usuários: ${error.message}`)
        }
    }

    static async buscarPorId(id) {
        try {
            const query = `SELECT ${COLUNAS_PUBLICAS} FROM usuarios WHERE id = $1`
            const result = await pool.query(query, [id])
            return result.rows[0] || null
        } catch (error) {
            throw new Error(`Erro ao buscar usuário por ID: ${error.message}`)
        }
    }

    static async buscarPorEmail(email) {
        try {
            const query = 'SELECT * FROM usuarios WHERE email = $1'
            const result = await pool.query(query, [email])
            return result.rows[0] || null
        } catch (error) {
            throw new Error(`Erro ao buscar usuário por e-mail: ${error.message}`)
        }
    }

    static async buscarPorUsuario(usuario) {
        try {
            const query = 'SELECT * FROM usuarios WHERE usuario = $1'
            const result = await pool.query(query, [usuario])
            return result.rows[0] || null
        } catch (error) {
            throw new Error(`Erro ao buscar pelo nome de usuário: ${error.message}`)
        }
    }

    static async criar({ nome, sobrenome, email, usuario, senha, ativo = true }) {
        try {
            const query = `
                INSERT INTO usuarios (nome, sobrenome, email, usuario, senha, ativo)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING ${COLUNAS_PUBLICAS}
            `
            const values = [nome, sobrenome, email, usuario, senha, ativo]
            const result = await pool.query(query, values)
            return result.rows[0]
        } catch (error) {
            throw new Error(`Erro ao criar usuário: ${error.message}`)
        }
    }

    static async atualizar(id, dados) {
        try {
            const { nome, sobrenome, email, usuario, senha, ativo } = dados

            const query = `
                UPDATE usuarios
                SET nome = COALESCE($1, nome),
                    sobrenome = COALESCE($2, sobrenome),
                    email = COALESCE($3, email),
                    usuario = COALESCE($4, usuario),
                    senha = COALESCE($5, senha),
                    ativo = COALESCE($6, ativo),
                    data_alteracao = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING ${COLUNAS_PUBLICAS}
            `
            const values = [nome, sobrenome, email, usuario, senha, ativo, id]
            const result = await pool.query(query, values)
            return result.rows[0] || null
        } catch (error) {
            throw new Error(`Erro ao atualizar usuário: ${error.message}`)
        }
    }

    static async deletar(id) {
        try {
            const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING id'
            const result = await pool.query(query, [id])
            return result.rowCount > 0
        } catch (error) {
            throw new Error(`Erro ao deletar usuário: ${error.message}`)
        }
    }
}

module.exports = UsuarioModel