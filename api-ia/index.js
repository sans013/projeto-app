require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const AssistenteDocumento = require('./AssistenteDocumento');

const app = express();
const port = process.env.PORT || 3001;

// Configuração de middlewares
app.use(cors());
app.use(express.json());

// Instancia e inicia o processo do assistente
const caminhoPdf = path.join(__dirname, 'documentos', 'artigo-campus.pdf');
const assistente = new AssistenteDocumento(caminhoPdf);

// Começa a carregar o PDF em segundo plano assim que a API liga
assistente.inicializar().catch(console.error);

// Rota de Health Check
app.get('/saude', (req, res) => {
  res.json({ status: 'OK' });
});

// Rota Principal
app.post('/perguntar', async (req, res) => {
  try {
    const { pergunta } = req.body;

    // Validação: Pergunta vazia
    if (!pergunta || typeof pergunta !== 'string' || pergunta.trim() === '') {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'A pergunta enviada é vazia ou inválida.' 
      });
    }

    // Validação: Pergunta muito longa
    if (pergunta.length > 500) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'A pergunta excede o limite máximo de 500 caracteres.' 
      });
    }

    // Consulta ao modelo
    const dados = await assistente.perguntar(pergunta);

    return res.json({
      sucesso: true,
      mensagem: 'Resposta gerada com sucesso.',
      dados: {
        resposta: dados.resposta,
        tokens: dados.tokens
      }
    });

  } catch (erro) {
    if (erro.status === 429) {
      return res.status(429).json({ sucesso: false, mensagem: erro.message });
    }
    
    console.error('Erro na rota /perguntar:', erro);
    return res.status(500).json({ sucesso: false, mensagem: 'Erro interno do servidor ao tentar processar o PDF.' });
  }
});

app.listen(port, () => {
  console.log(`API IA escutando na porta ${port}`);
});

// Exportar o app é necessário para o Serverless do Vercel funcionar com Express
module.exports = app;