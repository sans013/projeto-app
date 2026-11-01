# Prompt para corrigir a API de perguntas sobre PDF

Você é um engenheiro de software sênior especializado em Node.js, Express, Google Gemini API e deploy serverless na Vercel.

## Contexto

O projeto é uma API pública, gratuita, feita em Node.js e Express. Um aplicativo mobile chama a rota `POST /perguntar`, que envia uma pergunta e recebe uma resposta baseada no PDF `documentos/artigo-campus.pdf` usando a Gemini API.

Os arquivos principais são `index.js` e `AssistenteDocumento.js`. Faça alterações pequenas e focadas. **Não reescreva o projeto inteiro e não adicione complexidade sem necessidade.**

## Objetivos

Implemente as correções abaixo, nesta ordem:

1. **Modelo Gemini configurável e válido**
   - Não mantenha como padrão um modelo que esteja desativado.
   - Use um identificador de modelo atualmente suportado, confirmado na documentação oficial vigente, ou exija `GEMINI_MODELO` explicitamente se não puder confirmar um padrão seguro.
   - Valide no início da aplicação a presença de `GEMINI_API_KEY` e forneça erro de configuração claro sem expor o segredo.

2. **Proteção contra abuso**
   - Adicione rate limiting apropriado para uma API pública.
   - Considere que a Vercel pode executar múltiplas instâncias: não dependa apenas de memória local para impor limites globais.
   - Se for necessária uma dependência ou serviço externo para rate limiting distribuído, explique a opção e configure-a por variáveis de ambiente. Não finja que o limite é global se ele for apenas por instância.
   - Não use uma chave secreta fixa embutida no aplicativo mobile como mecanismo de autenticação.
   - Mantenha mensagens de erro e respostas compatíveis com o contrato atual sempre que possível.

3. **Expiração do arquivo na Gemini Files API**
   - Considere que arquivos enviados podem expirar ou ser removidos.
   - Registre o momento do upload e renove o arquivo antes da expiração documentada, com margem de segurança.
   - Trate erros de arquivo expirado/inexistente invalidando a referência antiga e tentando recuperar de forma controlada, sem criar ciclos infinitos de upload.
   - Verifique o comportamento em execução serverless, onde a memória da instância não é persistente.

4. **Resistência a prompt injection e respostas sem suporte documental**
   - Mantenha a instrução de responder com base no documento, mas não trate a instrução do sistema como garantia absoluta.
   - Não afirme que a resposta é comprovadamente fundamentada se não houver mecanismo de verificação.
   - Se for viável dentro do escopo atual, inclua trechos relevantes do documento no contexto e exija referências identificáveis; explique limitações restantes.
   - Não implemente uma arquitetura RAG completa sem justificar por que ela é necessária.

5. **Limite de saída**
   - Configure `maxOutputTokens` com um valor razoável para respostas curtas.
   - Preserve o idioma português e a exigência de citar seção/artigo quando o documento permitir.

6. **Validação de requisição**
   - Trate `req.body` ausente ou inválido sem provocar erro 500 por desestruturação.
   - Mantenha a validação de `pergunta` como string não vazia e com limite de 500 caracteres.
   - Considere configurar um limite explícito para o tamanho do corpo JSON e tratar erros de parsing de forma adequada.

7. **Erros**
   - Não lance objetos comuns com `throw`; use instâncias de `Error` com propriedades adicionais quando necessário.
   - Preserve o status HTTP esperado para limite de uso (429) e evite expor detalhes internos ou segredos ao cliente.
   - Registre detalhes técnicos no servidor sem despejar credenciais ou dados sensíveis nos logs.

8. **CORS**
   - Não trate CORS como autenticação.
   - Como a API foi planejada para ser pública e consumida por um app mobile, documente a decisão sobre CORS. Se não houver cliente web com origem conhecida, explique por que CORS permissivo não protege a API e mantenha a defesa contra abuso no servidor.

## Restrições

- Preserve a separação atual entre a rota HTTP (`index.js`) e o serviço de documento/Gemini (`AssistenteDocumento.js`), salvo motivo técnico concreto.
- Não reescreva o código inteiro.
- Não adicione autenticação fictícia ou segredos no app mobile.
- Não invente nomes de modelos Gemini, configurações da Vercel ou comportamento da API. Quando depender de documentação atual, verifique fontes oficiais e cite-as no resumo.
- Não registre a chave da Gemini, tokens de autenticação ou conteúdo sensível nos logs.
- Evite mudanças incompatíveis no formato JSON já consumido pelo aplicativo.

## Verificação e entrega

1. Inspecione os arquivos atuais antes de editar.
2. Implemente apenas correções justificadas.
3. Adicione ou atualize testes para:
   - pergunta ausente, vazia, não textual e acima de 500 caracteres;
   - corpo JSON malformado;
   - falha de inicialização por configuração ausente;
   - erro 429 da Gemini;
   - falha de upload e renovação de arquivo expirado;
   - limitação de requisições;
   - erro inesperado sem vazamento de detalhes internos.
4. Execute os testes e informe quais foram executados e seus resultados. Se não for possível executá-los, diga isso explicitamente.
5. Entregue um resumo por arquivo com:
   - problema corrigido;
   - decisão tomada;
   - justificativa;
   - limitações ou riscos que permaneceram;
   - dependências ou variáveis de ambiente novas.
6. Não declare que a API está pronta para produção sem validar o deploy e as integrações externas.
