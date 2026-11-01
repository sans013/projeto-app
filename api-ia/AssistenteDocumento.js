const { GoogleGenAI } = require("@google/genai");

class AssistenteDocumento {
  constructor(caminhoPdf) {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.modelo = (process.env.GEMINI_MODELO || "gemini-3.8-flash").trim().replace(/['"]/g, '');
    this.caminhoPdf = caminhoPdf;
    this.arquivoEnviado = null; // Renomeado para ficar mais claro
    this.uploadPromise = null;
  }

  async inicializar() {
    if (!this.uploadPromise) {
      this.uploadPromise = (async () => {
        console.log(`[Gemini] Iniciando upload do PDF: ${this.caminhoPdf}...`);
        try {
          const resultado = await this.ai.files.upload({
            file: this.caminhoPdf,
            config: { mimeType: "application/pdf" }
          });
          console.log("[Gemini] Upload concluído com sucesso!");
          return resultado;
        } catch (erro) {
          console.error("[Gemini] Erro ao fazer upload do documento:", erro);
          this.uploadPromise = null; 
          throw erro;
        }
      })();
    }
    this.arquivoEnviado = await this.uploadPromise;
  }

  async perguntar(pergunta) {
    if (!this.arquivoEnviado) {
      await this.inicializar();
    }

    const config = {
      systemInstruction: "responda só com base no documento; cite o artigo ou a seção de onde tirou a resposta; se a resposta não estiver no documento, diga \"Não encontrei isso no documento\"; responda em português, em poucas frases."
    };

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelo,
        contents: [
          // Correção: Empacotando o arquivo no formato exato que a API REST exige
          {
            fileData: {
              fileUri: this.arquivoEnviado.uri,
              mimeType: this.arquivoEnviado.mimeType
            }
          },
          pergunta
        ],
        config: config
      });
      
      const tokens = response.usageMetadata ? response.usageMetadata.totalTokenCount : 0;
      
      return {
        resposta: response.text,
        tokens: tokens
      };
    } catch (erro) {
       if (erro.status === 429 || (erro.message && erro.message.includes('429'))) {
           throw { status: 429, message: 'Limite de uso da Gemini API excedido. Aguarde um momento e tente novamente.' };
       }
       throw erro;
    }
  }
}

module.exports = AssistenteDocumento;