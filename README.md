# Capital Atelier

Sistema de **Gestão Financeira Pessoal e Compartilhada** desenvolvido com **React + Vite + Tailwind CSS + shadcn/ui** no frontend e **Spring Boot + JPA/Hibernate + MySQL** no backend.

O projeto adota uma identidade visual minimalista, monocromática e geométrica (`0px` de border-radius, interações instantâneas, tema Claro/Escuro e ícone autoral `CA`).

---

## Links de Produção (Deploy)

- **Aplicação Web (Frontend):** `https://capital-atelier.vercel.app`
- **API REST (Backend):** `https://capital-atelier-api.onrender.com`
- **Documentação da API (Swagger / OpenAPI):** `https://capital-atelier-api.onrender.com/swagger-ui/index.html`

---

## Contas Demo (Seeder)

Na primeira inicialização do backend (com `APP_SEED_ENABLED=true`), o `SuitsDataSeeder` popula automaticamente 3 contas, 2 carteiras (uma compartilhada e uma pessoal), categorias e 17 lançamentos distribuídos em 3 meses, gravando a marca `suits-demo-v1` na tabela `seed_executions` para garantir **execução única**.

| Usuário | E-mail | Senha | Papel na carteira compartilhada |
| :--- | :--- | :--- | :--- |
| Harvey Specter | `harvey@pearsonspecter.com` | `Suits@2026` | `OWNER` (Proprietário) |
| Mike Ross | `mike@pearsonspecter.com` | `Suits@2026` | `EDITOR` (Lança e edita) |
| Louis Litt | `louis@pearsonspecter.com` | `Suits@2026` | `VIEWER` (Somente leitura) |

---

## Funcionalidades Implementadas

1. **Integração Completa (Frontend + Backend + Banco Real):**
   - Autenticação JWT (cadastro, login, recuperação e redefinição de senha via e-mail SMTP/Thymeleaf, edição de perfil e troca de senha).
   - Gestão de **Carteiras** pessoais e compartilhadas com controle de papéis (`OWNER`, `EDITOR`, `VIEWER`).
   - CRUD completo de **Transações** (com paginação e filtros por tipo, categoria e período) e **Categorias**.
   - **Dashboard** consolidado com saldo, receitas, despesas, gráfico mensal e distribuição por categoria.
2. **Comunicação em Tempo Real (SSE):**
   - Endpoint `GET /api/v1/wallets/{walletId}/events` (`text/event-stream`) via `SseEmitter` com heartbeat a cada 25s e cliente `fetch` stream autenticado por Bearer token.
   - Atualização automática do Dashboard e da lista de Transações quando qualquer membro da carteira compartilhada cria, edita ou exclui lançamentos.
3. **Relatórios e Exportação:**
   - Página `/reports` com atalhos de período, filtros, resumo por categoria e extrato detalhado.
   - Exportação em **CSV** UTF-8 no backend (`/api/v1/wallets/{walletId}/reports/export/csv`) com proteção contra *CSV Injection* e layout `@media print` dedicado para **Impressão / PDF**.
4. **Integração com IA (Google Gemini):**
   - **Análise Financeira (`/api/v1/wallets/{walletId}/ai/insights`)**: gera resumo executivo, pontos de atenção e recomendação prática sobre os gastos reais do período.
   - **Sugestão Automática de Categoria (`/api/v1/wallets/{walletId}/ai/categorize`)**: sugere a categoria mais compatível a partir da descrição do lançamento.

---

## Variáveis de Ambiente

### Backend (`backend/src/main/resources/application.properties` ou Env Vars)

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `DB_URL` | URL JDBC do banco MySQL | `jdbc:mysql://localhost:3306/capital_atelier?createDatabaseIfNotExist=true` |
| `DB_USERNAME` | Usuário do banco | `root` |
| `DB_PASSWORD` | Senha do banco | `sua_senha` |
| `JWT_SECRET` | Chave secreta (mín. 256 bits) para assinatura JWT | `uma-chave-secreta-forte-com-mais-de-32-caracteres` |
| `MAIL_HOST` | Servidor SMTP | `smtp.gmail.com` |
| `MAIL_PORT` | Porta SMTP | `587` |
| `MAIL_USERNAME` | E-mail remetente SMTP | `seu_email@gmail.com` |
| `MAIL_PASSWORD` | Senha de aplicativo SMTP | `sua_app_password` |
| `BREVO_API_KEY` | Chave da API HTTP da Brevo (recomendado no Render Free) | `xkeysib-...` |
| `BREVO_SENDER_EMAIL` | E-mail remetente verificado na Brevo | `seu_email@gmail.com` |
| `GEMINI_API_KEY` | Chave gratuita do Google AI Studio (`https://aistudio.google.com/apikey`) | `AIzaSy...` |
| `GEMINI_API_MODEL` | Modelo Gemini utilizado (opcional) | `gemini-2.5-flash` |
| `CORS_ALLOWED_ORIGINS` | Origens permitidas separadas por vírgula | `http://localhost:5173,https://capital-atelier.vercel.app` |
| `APP_SEED_ENABLED` | Habilita o seeder único na inicialização | `true` |

> Para desenvolvimento local, você também pode copiar `backend/src/main/resources/application-secrets-example.properties` para `application-secrets.properties` (ignorado pelo Git).

### Frontend (`frontend/.env`)

| Variável | Descrição | Exemplo |
| :--- | :--- | :--- |
| `VITE_BACKEND_URL` | URL base da API Spring Boot | `http://localhost:8080` |

---

## Como Rodar Localmente

### 1. Pré-requisitos e Banco de Dados
- Certifique-se de que o serviço **MySQL** esteja em execução na porta `3306` (ex.: MySQL local ou XAMPP).
- Não é necessário criar o banco manualmente: o `application.properties` usa `createDatabaseIfNotExist=true`, criando automaticamente a base `capital_atelier` na primeira execução (junto com as tabelas JPA e os dados demo do `SuitsDataSeeder`).
- Copie `backend/src/main/resources/application-secrets-example.properties` para `backend/src/main/resources/application-secrets.properties` e preencha suas credenciais locais (banco, JWT, SMTP e `gemini.api.key`).

### 2. Backend
```bash
cd backend
./mvnw spring-boot:run
```
- API: `http://localhost:8080`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
- Aplicação: `http://localhost:5173`

### 4. Testes e Validações
```bash
# Testes unitários do backend
cd backend
./mvnw test -Dtest="TransactionServiceTest,ReportServiceTest,SummaryServiceTest,RateLimitFilterTest"

# Lint, formatação e build de produção do frontend
cd frontend
npm run lint
npm run format:check
npm run build
```

---

## Principais Decisões Técnicas

1. **SSE (`SseEmitter`) sobre HTTP em vez de WebSocket/STOMP:** oferece atualização unidirecional em tempo real do servidor para clientes da carteira compartilhada com menor sobrecarga, reconexão simples e maior estabilidade em proxies de hospedagem gratuita. A assinatura utiliza `fetch` + `ReadableStream` com cabeçalho `Authorization: Bearer`, evitando trafegar JWT na query string.
2. **IA via `RestClient` no backend:** mantém a `GEMINI_API_KEY` protegida no servidor, limita a exposição de dados pessoais no prompt e entrega respostas JSON estruturadas sob demanda.
3. **Seeder com tabela `seed_executions`:** garante execução única atômica mesmo após alterações nos registros demo durante testes ou apresentações.
4. **Design System monocromático e geométrico:** tokens semânticos Light/Dark em Tailwind v4 (`src/index.css`), cantos retos (`0px`) e remoção de animações decorativas para priorizar legibilidade e velocidade percebida.
