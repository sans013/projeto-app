# App Gestão e Chat IA

## O que o app faz
Este projeto é um aplicativo desenvolvido em React Native (rodando no navegador web) voltado para a gestão de usuários e interação com uma Inteligência Artificial. Ele permite o cadastro, login e gerenciamento completo (listar, editar, buscar e excluir) de usuários, utilizando um banco de dados PostgreSQL. Após o login, o usuário tem acesso a uma tela principal que inclui um chat interativo. Esse chat se conecta a uma API especializada (api-ia) que utiliza a IA do Google Gemini para ler um documento PDF em anexo e responder perguntas estritamente baseadas no conteúdo desse arquivo.

## Como instalar e rodar

### api-usuarios
1. **O que instalar**: Tenha o Node.js e o PostgreSQL (recomendado usar junto com pgAdmin) instalados na sua máquina. Na pasta `api-usuarios`, rode o comando `npm install` no terminal para baixar as dependências (`express`, `pg`, `bcryptjs`, `jsonwebtoken`, etc).
2. **Como criar o banco**: Abra o pgAdmin (ou terminal psql) e crie um banco de dados chamado `app_usuarios`. Em seguida, execute o script do arquivo `banco.sql` fornecido para criar o schema `app` e a tabela `usuarios`.
3. **Variáveis de ambiente**: Crie um arquivo `.env` na raiz da pasta `api-usuarios` com as seguintes chaves:
   - `DB_USER=postgres` (ou seu usuário)
   - `DB_PASSWORD=sua_senha_aqui`
   - `DB_PORT=5433` (ou a porta correspondente da sua versão do PG, ex: 5432)
   - `DB_HOST=localhost`
   - `DB_NAME=app_usuarios`
   - `JWT_SECRET=sua_chave_secreta_aqui`
4. **Comando para rodar**: No terminal da `api-usuarios`, execute `npm run dev`. O servidor subirá em `http://localhost:3000`.

### app
1. **O que instalar**: Na pasta `app`, abra o terminal e rode `npm install` (ou `npx expo install` caso precise alinhar pacotes do Expo) para baixar as dependências do React Native Web.
2. **Variáveis de ambiente**: Não há um arquivo `.env` exigido por padrão, mas certifique-se de que no arquivo `app/servicos/api.js` a constante `API_URL` aponte para `http://localhost:3000/api/usuarios`.
3. **Comando para rodar**: No terminal da pasta `app`, execute `npm run web` (ou `npx expo start --web`). O app abrirá no seu navegador.

### api-ia
1. **O que instalar**: Na pasta `api-ia`, abra o terminal e rode `npm install` para instalar as dependências, incluindo o `@google/genai`.
2. **Variáveis de ambiente**: Crie um arquivo `.env` na raiz desta pasta com:
   - `GEMINI_API_KEY=sua_chave_do_google_aqui`
   - `GEMINI_MODELO=gemini-3.8-flash`
3. **Comando para rodar**: No terminal da `api-ia`, execute `npm run dev` para rodar localmente na porta 3001, ou faça o deploy no Vercel (onde as variáveis de ambiente devem ser configuradas no painel da plataforma).

## A api-ia on-line
**Endereço:** `https://api-ia-fawn.vercel.app`

**Pedido de exemplo:**
```http
POST https://api-ia-fawn.vercel.app/perguntar
Content-Type: application/json

{
  "pergunta": "Qual é o principal objetivo discutido na introdução do artigo?"
}
```

**IA, Modelo e Por Quê:** Foi utilizada a IA **Google Gemini**, especificamente o modelo **gemini-3.8-flash** com a nova SDK `@google/genai`. A escolha deste modelo ocorreu porque o anterior (`1.5-flash`) estava retornando erro 404 (Not Found) na nova SDK. O modelo 3.8-flash entrega alta velocidade e processamento eficiente para leitura de arquivos PDF. 
**Limite da IA:** A API possui um limite de requisições por minuto. Caso exceda o uso, o servidor retornará um erro HTTP 429 (`Limite de uso da Gemini API excedido. Aguarde um momento e tente novamente.`), o qual já é tratado pelo nosso código.

## Onde está
- **O arquivo do token:** O token gerado no login fica armazenado na memória da aplicação, no arquivo `app/servicos/api.js` (através das funções `setToken` e `clearToken` manipulando a variável `tokenMemoria`).
- **O arquivo da senha criptografada:** A configuração de criptografia da senha utilizando `bcryptjs` se encontra no backend, na estrutura do controlador de usuários (`api-usuarios/UsuarioController.js` e no modelo `UsuarioModel.js`).
- **O arquivo da chave (API Key):** A chave do Gemini é lida no arquivo `api-ia/AssistenteDocumento.js` (através de `process.env.GEMINI_API_KEY`).
- **O arquivo da instrução de sistema:** O System Prompt ("responda só com base no documento...") está definido no arquivo `api-ia/AssistenteDocumento.js`, dentro da constante `config`, na chave `systemInstruction`.