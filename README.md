# 🗓️ Agendamento Inteligente

Uma aplicação web de calendário moderno que utiliza Inteligência Artificial para interpretar linguagem natural e automatizar a criação de compromissos. Desenvolvido com foco em performance e experiência do usuário (Optimistic UI).

## 🚀 Funcionalidades

* **Processamento de Linguagem Natural (IA):** Digite o que precisa fazer e o sistema extrai título, data, hora de início/fim e categoriza o contexto automaticamente.
* **Categorização Dinâmica por Cores:**
  * 🟣 **Estudos:** Identifica eventos acadêmicos (ex: "Entregar o MAPA de Redes amanhã às 20h").
  * 🔵 **Trabalho:** Identifica demandas profissionais e técnicas (ex: "Migração do servidor AD no sábado às 23h").
  * 🟢 **Pessoal:** Eventos cotidianos padrão.
* **Interface Interativa e Flexível:** Agende eventos via *prompt* de texto ou clique diretamente na grade do calendário para criação manual. Alterne rapidamente entre visualizações de Mês, Semana, Dia e Agenda.
* **Feedback Visual Instantâneo:** Utilização de notificações flutuantes (*toasts*) para mascarar a latência de rede e manter a interface fluida durante requisições assíncronas.
* **CRUD Completo:** Criação, leitura, atualização e exclusão de eventos com persistência em nuvem.

## 💻 Tecnologias Utilizadas

**Frontend**
* Next.js (App Router)
* React
* Tailwind CSS
* React Big Calendar
* Sonner (Notificações)
* date-fns

**Backend & Inteligência Artificial**
* Google Gemini API (Família 1.5 Flash)
* Vercel AI SDK
* Zod (Validação de Schemas)

**Banco de Dados & Infraestrutura**
* MySQL (Hospedado na AWS RDS)
* Prisma ORM

## 🛠️ Como executar o projeto localmente

**1. Clone o repositório**
```bash
git clone [https://github.com/RichLapu/Agendamento-Inteligente.git](https://github.com/RichLapu/Agendamento-Inteligente.git)
```c

**2. Instale as dependências**
```bash
npm install
```

**3. Configure as Variáveis de Ambiente**
Crie um arquivo chamado `.env` na raiz do projeto e adicione suas credenciais de segurança. **Nunca comite este arquivo.**
```env
DATABASE_URL="mysql://usuario:senha@seu-endpoint-aws.us-east-1.rds.amazonaws.com:3306/nome_do_banco"
GEMINI_API_KEY="sua_chave_api_do_google"
```

**4. Sincronize o Banco de Dados**
Gere o cliente do Prisma e empurre as tabelas para a sua instância na AWS:
```bash
npx prisma generate
npx prisma db push
```

**5. Inicie o Servidor**
```bash
npm run dev
```
Acesse `http://localhost:3000` no seu navegador para utilizar a ferramenta.