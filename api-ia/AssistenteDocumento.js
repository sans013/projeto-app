const { GoogleGenAI } = require("@google/genai");

class AssistenteDocumento {
  constructor(caminhoPdf) {
    // Instancia o cliente da nova SDK. Passamos a chave explicitamente para garantir.
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.modelo = process.env.GEMINI_MODELO || "gemini-1.5-flash";
    this.caminhoPdf = caminhoPdf;
    this.arquivoId = null;
    this.uploadPromise = null;
  }

  // Faz o upload do arquivo para a API. Retorna uma promise única (evita uploads simultâneos).
  async inicializar() {
    if (!this.uploadPromise) {
      this.uploadPromise = (async () => {
        console.log(`[Gemini] Iniciando upload do PDF: ${this.caminhoPdf}...`);
        try {
          const arquivoEnviado = await this.ai.files.upload({
            file: this.caminhoPdf,
            config: { mimeType: "application/pdf" }
          });
          console.log("[Gemini] Upload concluído com sucesso!");
          return arquivoEnviado;
        } catch (erro) {
          console.error("[Gemini] Erro ao fazer upload do documento:", erro);
          this.uploadPromise = null; // Libera para tentar novamente
          throw erro;
        }
      })();
    }
    this.arquivoId = await this.uploadPromise;
  }

  async perguntar(pergunta) {
    // Garante que o documento foi carregado antes de responder
    if (!this.arquivoId) {
      await this.inicializar();
    }

    const config = {
      systemInstruction: "responda só com base no documento; cite o artigo ou a seção de onde tirou a resposta; se a resposta não estiver no documento, diga \"Não encontrei isso no documento\"; responda em português, em poucas frases."
    };

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelo,
        contents: [
          this.arquivoId,
          pergunta
        ],
        config: config
      });
      
      // Captura o gasto de tokens com a chave usageMetadata
      const tokens = response.usageMetadata ? response.usageMetadata.totalTokenCount : 0;
      
      return {
        resposta: response.text,
        tokens: tokens
      };
    } catch (erro) {
       // Identifica se a falha é de rate limit ou cota excedida (Erro 429)
       if (erro.status === 429 || (erro.message && erro.message.includes('429'))) {
           throw { status: 429, message: 'Limite de uso da Gemini API excedido. Aguarde um momento e tente novamente.' };
       }
       throw erro;
    }
  }
}

module.exports = AssistenteDocumento;