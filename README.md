# 💰 MFE Dashboard - Sistema de Transações

## 📋 Descrição

O MFE Dashboard é o coração operacional do ByteBank, oferecendo uma interface completa para gerenciamento de transações financeiras, visualização de saldo e histórico de operações.

## 🏗️ Arquitetura

### Responsabilidades
- **Dashboard Principal**: Interface central do usuário
- **Gestão de Transações**: CRUD completo de transações
- **Visualização Financeira**: Saldo, histórico e relatórios
- **Filtros Avançados**: Busca e filtros por tipo, período e valor
- **Paginação**: Navegação eficiente em grandes volumes de dados

### ENV

```
NEXT_PUBLIC_API_URL = "https://byte-bank-api.onrender.com/api"
NEXT_PUBLIC_MF_URL_AUTH = "http://localhost:3002"
```


### Estrutura de Pastas
```
src/
├── app/                    # Páginas Next.js
│   ├── page.tsx           # Dashboard principal
│   └── layout.tsx         # Layout com header
├── components/            # Componentes reutilizáveis
│   ├── header.tsx         # Header com menu do usuário
│   ├── menu.tsx           # Menu de navegação
│   ├── new_transactions.tsx # Modal de nova transação
│   ├── transactionItem.tsx # Item de transação
│   └── ui/                # Componentes UI base
├── context/               # Contextos React
│   └── AuthContext.tsx    # Contexto de autenticação
├── services/              # Serviços de API
│   ├── AuthService.ts     # Autenticação
│   ├── AccountService.ts  # Gestão de contas
│   └── TransactionService.ts # Gestão de transações
├── models/                # Modelos de dados
│   ├── User.ts           # Modelo de usuário
│   ├── Account.ts        # Modelo de conta
│   ├── Transaction.ts    # Modelo de transação
│   └── TransactionType.ts # Tipos de transação
└── views/                 # Views principais
    ├── WelcomeSection.tsx # Seção de boas-vindas
    └── TransactionsSection.tsx # Seção de transações
```

## 🚀 Tecnologias

- **Next.js 14** com App Router
- **TypeScript**
- **Tailwind CSS**
- **React Hot Toast** para notificações
- **Lucide React** para ícones
- **Axios** para requisições HTTP

## 🔧 Instalação

```bash
cd mfe-dashboard-pos-tech
npm install
npm run dev
```

## 🔐 Autenticação

### Fluxo de Autenticação
1. MFE Core carrega o dashboard em iframe
2. Dashboard solicita token via `postMessage`
3. MFE Core responde com token armazenado
4. Dashboard valida token e carrega dados do usuário
5. Interface é renderizada com dados do usuário

### Comunicação com MFE Core

```typescript
// Solicitação de token
window.parent.postMessage({ type: "REQUEST_TOKEN" }, "*");

// Logout
window.parent.postMessage({ type: "AUTH_LOGOUT" }, "*");

// Recebimento de token
window.addEventListener('message', (event) => {
  if (event.data.type === 'TOKEN_RESPONSE') {
    const token = event.data.token;
    if (token) {
      localStorage.setItem('auth_token', token);
      // Carregar dados do usuário
    }
  }
});
```

## 💰 Funcionalidades

### Dashboard Principal
- **Saldo Atual**: Exibição do saldo em tempo real
- **Resumo Financeiro**: Visão geral das finanças
- **Transações Recentes**: Últimas 5 transações
- **Ações Rápidas**: Botões para ações comuns

### Gestão de Transações

#### Tipos de Transação
- **Depósito** 💰 - Adicionar dinheiro à conta
- **Saque** 💸 - Retirar dinheiro da conta
- **Transferência** 🔄 - Enviar dinheiro para outra conta

#### Operações Disponíveis
- ✅ **Criar** nova transação
- 👁️ **Visualizar** detalhes
- ✏️ **Editar** transação existente
- 🗑️ **Excluir** transação
- 🔍 **Filtrar** por múltiplos critérios

### Filtros Avançados

#### Por Tipo
- Todos os tipos
- Apenas depósitos
- Apenas saques
- Apenas transferências

#### Por Período
- Hoje
- Últimos 7 dias
- Últimos 30 dias
- Últimos 90 dias
- Período personalizado

#### Por Valor
- Faixa de valores
- Valor mínimo/máximo
- Transações acima de X
- Transações abaixo de Y

### Paginação
- **10 itens por página** (configurável)
- **Navegação intuitiva** com botões anterior/próximo
- **Indicador de página atual**
- **Total de registros** exibido

## 📊 Interface do Usuário

### Header
- **Nome do usuário** exibido
- **Menu dropdown** com opções
- **Botão de logout** integrado
- **Design responsivo** para mobile

### Seção de Boas-vindas
- **Mensagem personalizada** com nome do usuário
- **Saldo atual** em destaque
- **Ilustrações animadas** para melhor UX
- **Ações rápidas** para transações comuns

### Lista de Transações
- **Cards informativos** para cada transação
- **Ícones visuais** por tipo de transação
- **Informações detalhadas**: data, valor, descrição
- **Ações contextuais** (editar/excluir)

## 🔄 API Integration

### Endpoints Utilizados

#### Autenticação
```typescript
GET /api/me - Dados do usuário e contas
POST /api/logout - Logout
```

#### Transações
```typescript
GET /api/transactions - Listar transações (com filtros)
POST /api/transactions - Criar nova transação
PUT /api/transactions/{id} - Atualizar transação
DELETE /api/transactions/{id} - Excluir transação
```

#### Contas
```typescript
GET /api/accounts - Listar contas do usuário
```

### Exemplo de Requisição

```typescript
// Criar nova transação
const newTransaction = {
  type: 'deposit',
  amount: 100.00,
  description: 'Depósito inicial',
  account_id: 1
};

const response = await TransactionService.createTransaction(newTransaction);
```

## 🎨 Design System

### Cores Principais
- **Primary**: `#004D61` (Azul escuro)
- **Secondary**: `#47A138` (Verde)
- **Accent**: `#FF5031` (Laranja)
- **Background**: `#F5F5F5` (Cinza claro)

### Componentes UI
- **Button**: Botões com variantes (primary, secondary, danger)
- **Card**: Cards para exibição de informações
- **Input**: Campos de entrada com validação
- **Dialog**: Modais para ações importantes
- **Select**: Dropdowns para seleção de opções

## 📱 Responsividade

### Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

### Adaptações Mobile
- **Menu hambúrguer** no header
- **Cards empilhados** para transações
- **Botões maiores** para touch
- **Scroll horizontal** em tabelas

## 🐛 Debug e Logs

### Logs Importantes
- `🚀 Inicializando AuthContext do dashboard`
- `🔑 Solicitando token do MFE core`
- `✅ Token recebido e salvo`
- `🔄 Buscando dados atualizados do servidor`
- `💰 Transação criada com sucesso`

### Console Commands
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Testes
npm test

# Lint
npm run lint
```

## 🌐 Deploy

### Vercel
```bash
npm run build
vercel --prod
```

### Variáveis de Ambiente
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_CORE_URL=http://localhost:3000
```

## 🔒 Segurança

### Validações
- **Token JWT** obrigatório para todas as operações
- **Validação de entrada** em formulários
- **Sanitização** de dados antes do envio
- **Timeout** de sessão configurável

### Proteções
- **CORS** configurado adequadamente
- **Rate limiting** no backend
- **Validação de origem** das mensagens
- **Logs de auditoria** para transações

## 📈 Performance

### Otimizações
- **Lazy loading** de componentes pesados
- **Memoização** de dados frequentemente acessados
- **Debounce** em filtros de busca
- **Virtualização** para listas grandes

### Métricas
- **Tempo de carregamento** < 2s
- **Tempo de resposta** da API < 500ms
- **Bundle size** otimizado
- **Core Web Vitals** em conformidade

## 🧪 Testes

### Testes Unitários
```bash
npm run test:unit
```

### Testes de Integração
```bash
npm run test:integration
```

### Testes E2E
```bash
npm run test:e2e
```

## 🔄 Integração com Outros MFEs

### MFE Core
- Recebe tokens de autenticação
- Comunica logout para limpeza global
- Gerencia estado de autenticação

### MFE Auth
- Não tem integração direta
- Comunicação via MFE Core

### Backend Laravel
- API RESTful para todas as operações
- Autenticação JWT
- Validação de dados

---

**MFE Dashboard** - Suas finanças sob controle 💰
