# PROMPTS.md: registro da revisão e decisões

## Contexto

Foi revisada uma API Node.js/Express que responde perguntas sobre `documentos/artigo-campus.pdf` por meio da Gemini API. A API será pública, gratuita, hospedada na Vercel e consumida por um aplicativo mobile.

Este documento registra os pontos encontrados na revisão inicial e a decisão de implementação para cada um. As decisões abaixo são um plano de trabalho, não uma afirmação de que as correções já foram implementadas.

## Registro de achados

| Prioridade | Achado da revisão | Decisão | Observações |
|---|---|---|---|
| Alta | O valor padrão de `GEMINI_MODELO` era `gemini-1.5-flash`, identificado na revisão como modelo desativado. | **Corrigir antes do deploy.** Confirmar um modelo suportado na documentação oficial atual e configurar o nome por variável de ambiente. | Não fixar um identificador novo sem verificar sua disponibilidade vigente. |
| Alta | A rota `POST /perguntar` não tinha limitação de requisições. | **Implementar rate limiting.** Preferir solução compartilhada/distribuída adequada à Vercel e documentar se algum limite for apenas por instância. | A API pública pode ser abusada para consumir a cota da Gemini. Uma chave fixa dentro do app mobile não é proteção confiável. |
| Alta | A classe mantém `arquivoEnviado` em memória, embora o arquivo enviado à Gemini Files API possa expirar. | **Corrigir a gestão do ciclo de vida do arquivo.** Registrar o upload, renovar antes da expiração e tratar referências expiradas/inexistentes com recuperação limitada. | Em serverless, a memória pode desaparecer entre invocações; não depender dela como armazenamento persistente. |
| Média/alta | A `systemInstruction` pede respostas baseadas apenas no PDF, mas não garante resistência a prompt injection nem fundamentação factual. | **Endurecer sem prometer garantia absoluta.** Avaliar uso de trechos relevantes e referências verificáveis; documentar limitações. | Não implementar RAG completo sem justificar custo e complexidade. |
| Média | A chamada ao modelo não definia um limite técnico explícito para tokens de saída. | **Configurar `maxOutputTokens`** para manter respostas curtas e controlar consumo. | Escolher um limite compatível com o uso do aplicativo. |
| Média | `const { pergunta } = req.body` pode falhar se o corpo estiver ausente/indefinido. | **Corrigir a leitura e manter a validação existente.** Responder 400 para entradas inválidas; considerar limite para o corpo JSON e tratamento de JSON malformado. | Preservar o limite atual de 500 caracteres para `pergunta`. |
| Média | O tratamento de 429 lança um objeto comum, não uma instância de `Error`. | **Trocar por erro tipado/instância de `Error`**, preservando o status 429 e a mensagem pública apropriada. | Evitar perder stack trace e contexto útil de depuração. |
| Contextual | `cors()` permite qualquer origem. | **Não classificar isso isoladamente como falha crítica**, pois a API foi planejada como pública. Documentar a decisão e restringir origens se houver cliente web com domínios conhecidos. | CORS não autentica aplicativos mobile nem impede chamadas diretas por scripts. Rate limiting e outros controles devem existir no servidor. |
| Sem mudança necessária | A classe `AssistenteDocumento` concentra a integração com Gemini e o ciclo de upload; `index.js` concentra a camada HTTP. | **Manter a separação atual.** Não criar classes extras sem necessidade concreta. | A revisão não encontrou motivo suficiente para reestruturar a orientação a objetos. |
| Sem mudança necessária | `app.listen()` foi apontado como não sendo, por si só, um defeito na Vercel quando a aplicação Express também é exportada conforme o padrão suportado. | **Não alterar apenas por estilo.** Confirmar a configuração real de deploy e o entrypoint da Vercel. | O comportamento final depende da configuração do projeto. |

## Critérios para considerar os pontos concluídos

- [ ] O modelo configurado é suportado no momento do deploy e a configuração é validada.
- [ ] Há limitação de requisições adequada ao ambiente de execução, com limitações documentadas.
- [ ] O ciclo de vida do PDF trata expiração, falha de upload e reinicialização de instância.
- [ ] A aplicação limita tokens de saída e mantém respostas curtas em português.
- [ ] Entradas inválidas não geram erro 500 por falha de validação.
- [ ] Erros 429 são tratados corretamente; erros internos não vazam detalhes ao cliente.
- [ ] A abordagem para prompt injection e fundamentação no PDF tem limitações explicitadas.
- [ ] A decisão de CORS está documentada e não é apresentada como mecanismo de autenticação.
- [ ] Testes foram executados, com resultados registrados.
- [ ] Variáveis de ambiente e dependências novas foram documentadas.

## Próximo passo

Usar `PROMPT.md` para orientar uma implementação incremental. Depois, atualizar este arquivo com o estado real de cada item: **corrigido**, **parcialmente corrigido**, **adiado** ou **não aplicável**, incluindo evidências dos testes. Não marcar um item como concluído apenas porque o código foi alterado.
