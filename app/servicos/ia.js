const BASE_URL = 'https://api-ia-fawn.vercel.app';

export async function perguntarIA(pergunta) {
  try {
    const resposta = await fetch(`${BASE_URL}/perguntar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pergunta }),
    });
    
    const dados = await resposta.json();
    return dados;
  } catch (erro) {
    // Retorno amigável caso o servidor esteja fora do ar ou haja erro de rede
    return {
      sucesso: false,
      mensagem: 'Não foi possível conectar à IA no momento.',
      dados: null
    };
  }
}