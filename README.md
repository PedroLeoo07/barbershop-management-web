# BarberShop - Sistema de Gestão de Agendamentos

Sistema premium de gestão de agendamentos para barbearias, desenvolvido com Next.js, TypeScript e Design System próprio.

## 🎨 Design System

### Paleta de Cores
- **Preto Grafite**: `#1A1A1A` - Cor primária de fundo
- **Cinza Escuro**: `#2D2D2D` - Elementos secundários
- **Cinza Médio**: `#4A4A4A` - Elementos de interface
- **Dourado Fosco**: `#D4AF37` - Cor de destaque/CTA
- **Branco Suave**: `#F5F5F5` - Textos principais

### Tipografia
- **Fonte Principal**: System fonts (-apple-system, Segoe UI, Roboto)
- **Fonte Display**: Inter (para títulos e destaques)
- **Escala de tamanhos**: 12px → 48px
- **Pesos**: 300 (Light) → 700 (Bold)

### Componentes
Todos os componentes seguem um padrão consistente:
- **Estados**: hover, focus, disabled, loading
- **Variantes**: primary, secondary, outline, ghost, danger
- **Tamanhos**: small, medium, large
- **Animações**: suaves com Framer Motion (300ms padrão)

## 🏗️ Arquitetura

```
src/
├── app/                      # App Router do Next.js
│   ├── layout.tsx           # Layout raiz com AuthProvider
│   ├── page.tsx             # Redirecionamento inicial
│   ├── login/               # Página de login
│   ├── register/            # Página de cadastro
│   └── dashboard/           # Área autenticada
│       ├── layout.tsx       # Layout com sidebar e proteção
│       ├── page.tsx         # Dashboard principal
│       ├── appointments/    # Agendamento de serviços
│       ├── history/         # Histórico do cliente
│       ├── barber-schedule/ # Agenda do barbeiro
│       └── admin/           # Painel administrativo
│           ├── services/    # CRUD de serviços
│           ├── barbers/     # CRUD de barbeiros
│           └── schedules/   # Gerenciamento de horários
│
├── components/              # Componentes reutilizáveis
│   ├── Button/             # Componente de botão
│   ├── Input/              # Inputs e textareas
│   ├── Card/               # Cards premium
│   ├── Modal/              # Modais com overlay
│   └── Loading/            # Estados de carregamento
│
├── contexts/               # Contextos React
│   └── AuthContext.tsx    # Autenticação e usuário
│
├── lib/                   # Utilitários e API
│   └── api.ts            # Funções de API e mock data
│
├── styles/               # Estilos globais
│   ├── globals.css      # Reset e estilos base
│   └── tokens.ts        # Design tokens (cores, espaçamentos)
│
└── types/               # Definições TypeScript
    └── index.ts        # Todos os tipos do sistema
```

## 🔐 Sistema de Autenticação

### Contexto de Autenticação (`AuthContext`)
- **Estado Global**: Gerencia usuário autenticado
- **Persistência**: LocalStorage para sessão
- **Proteção de Rotas**: HOC no layout do dashboard
- **Roles**: `client`, `barber`, `admin`

### Contas de Demonstração
```
Cliente:
- Email: client@example.com
- Senha: 123456

Barbeiro:
- Email: barber@example.com
- Senha: 123456

Admin:
- Email: admin@example.com
- Senha: 123456
```

## 🎯 Funcionalidades por Role

### Cliente
- ✅ Visualizar serviços disponíveis
- ✅ Agendar serviço (escolher barbeiro, data e hora)
- ✅ Ver histórico de agendamentos
- ✅ Cancelar agendamentos futuros

### Barbeiro
- ✅ Visualizar agenda do dia
- ✅ Ver próximos agendamentos
- ✅ Marcar serviço como concluído
- ✅ Gerenciar disponibilidade

### Admin
- ✅ Dashboard com estatísticas
- ✅ CRUD completo de serviços
- ✅ CRUD completo de barbeiros
- ✅ Gerenciar horários de funcionamento
- ✅ Visualizar todos os agendamentos
- ✅ Relatórios e métricas

## 📱 Responsividade

Sistema totalmente responsivo com breakpoints:
- **Mobile**: 320px → 768px
- **Tablet**: 768px → 1024px
- **Desktop**: 1024px+

### Mobile First
- Sidebar colapsável em mobile
- Grid adaptativo para cards
- Formulários otimizados para toque
- Navegação simplificada

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos

1. **Instalar dependências**
```bash
npm install
```

2. **Executar em desenvolvimento**
```bash
npm run dev
```

3. **Acessar aplicação**
```
http://localhost:3000
```

4. **Build para produção**
```bash
npm run build
npm start
```

## 🔌 Integração com Backend

### Estrutura de API Esperada

```typescript
// Endpoints necessários
GET    /api/services              # Listar serviços
POST   /api/services              # Criar serviço
PUT    /api/services/:id          # Atualizar serviço
DELETE /api/services/:id          # Deletar serviço

GET    /api/barbers               # Listar barbeiros
GET    /api/barbers/:id           # Detalhes do barbeiro

GET    /api/appointments          # Listar agendamentos
POST   /api/appointments          # Criar agendamento
PUT    /api/appointments/:id      # Atualizar status
DELETE /api/appointments/:id      # Cancelar agendamento

GET    /api/availability          # Ver disponibilidade
GET    /api/dashboard/stats       # Estatísticas do dashboard

POST   /api/auth/login           # Login
POST   /api/auth/register        # Registro
POST   /api/auth/logout          # Logout
```

### Configuração

Criar arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Atualizar `src/lib/api.ts` para substituir os mocks pelas chamadas reais.

## 🎨 Personalização

### Cores
Editar `src/styles/tokens.ts` para alterar a paleta de cores.

### Componentes
Todos os componentes em `src/components/` são modulares e podem ser estilizados via CSS Modules.

### Animações
Integrar Framer Motion para animações:
```bash
npm install framer-motion
```

## 📊 Próximos Passos

### Funcionalidades Futuras
- [ ] Notificações por email/SMS
- [ ] Integração com calendário (Google Calendar)
- [ ] Sistema de avaliações
- [ ] Programa de fidelidade
- [ ] Pagamento online
- [ ] Relatórios avançados com gráficos
- [ ] Multi-idioma (i18n)
- [ ] Tema claro/escuro

### Melhorias Técnicas
- [ ] Testes unitários (Jest + Testing Library)
- [ ] Testes E2E (Playwright)
- [ ] CI/CD pipeline
- [ ] Otimização de imagens
- [ ] PWA (Progressive Web App)
- [ ] Server-side rendering otimizado

## 📝 Estrutura de Tipos

Todos os tipos TypeScript estão definidos em `src/types/index.ts`:
- `User` - Usuários do sistema
- `Barber` - Barbeiros (extends User)
- `Service` - Serviços oferecidos
- `Appointment` - Agendamentos
- `WorkingHours` - Horários de trabalho
- `DashboardStats` - Estatísticas

## 🎯 Boas Práticas Implementadas

✅ **TypeScript estrito** - Tipagem forte em todo o código
✅ **Componentes reutilizáveis** - Arquitetura modular
✅ **CSS Modules** - Estilos encapsulados
✅ **Design System** - Consistência visual
✅ **Mobile First** - Responsividade nativa
✅ **Acessibilidade** - ARIA labels e navegação por teclado
✅ **Performance** - Lazy loading e otimizações
✅ **SEO** - Metadata e estrutura semântica

## 👥 Contribuindo

Este é um projeto de demonstração. Para uso em produção, implemente:
1. Autenticação JWT real
2. Validação de formulários com bibliotecas (Zod, Yup)
3. Testes automatizados
4. Monitoramento de erros (Sentry)
5. Analytics (Google Analytics, Mixpanel)

## 📄 Licença

MIT License - Livre para uso comercial e modificação.

---

**Desenvolvido com ❤️ para barbearias modernas**
