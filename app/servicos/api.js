// URL base da sua API em Node.js
const API_URL = 'http://localhost:3000/api/usuarios';

// O token fica apenas na memória da aplicação, como solicitado.
let tokenMemoria = null;

export const setToken = (token) => { tokenMemoria = token; };
export const clearToken = () => { tokenMemoria = null; };

// Função interna genérica para fazer os pedidos à API
const request = async (endpoint, method = 'GET', body = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  // Adiciona o cabeçalho de autorização se o token estiver na memória
  if (tokenMemoria) {
    headers['Authorization'] = `Bearer ${tokenMemoria}`;
  }

  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();

    // Intercepta e dispara erro em caso de token expirado ou inválido
    if (response.status === 401) {
      throw new Error('401_UNAUTHORIZED');
    }

    return data;
  } catch (error) {
    if (error.message === '401_UNAUTHORIZED') {
      throw error;
    }
    // Mensagem de segurança caso a API caia
    throw new Error('Não foi possível conectar ao servidor.');
  }
};

export const login = (usuario, senha) => request('/login', 'POST', { usuario, senha });
export const cadastrar = (dados) => request('', 'POST', dados);
export const listarUsuarios = () => request('', 'GET');
export const buscarUsuario = (id) => request(`/${id}`, 'GET');
export const editarUsuario = (id, dados) => request(`/${id}`, 'PUT', dados);
export const excluirUsuario = (id) => request(`/${id}`, 'DELETE');