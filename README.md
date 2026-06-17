[README.md](https://github.com/user-attachments/files/29065092/README.md)
# 🔐 Secure Auth Next.js

Sistema de autenticação completo (cadastro, login, logout e área protegida) construído com **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Prisma** e **PostgreSQL**, com foco em boas práticas de segurança web.

🔗 **Demo:** [secure-auth-nextjs.vercel.app](https://secure-auth-nextjs.vercel.app)

---

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS |
| ORM | Prisma |
| Banco de dados | PostgreSQL (hospedado no [Neon](https://neon.tech)) |
| Hash de senha | bcryptjs |
| Sessão | JWT em cookie HttpOnly |
| Validação | Zod |
| Deploy | Vercel |

---

## 🔒 Segurança implementada

- **Hash de senha com bcrypt** (salt rounds 12) — senhas nunca são armazenadas em texto puro.
- **Validação de entrada com Zod** em todas as rotas de API, antes de qualquer acesso ao banco.
- **Proteção contra SQL Injection** via Prisma, que usa queries parametrizadas internamente.
- **Cookies HttpOnly + Secure** para a sessão, impedindo acesso via JavaScript no navegador (mitiga XSS) e garantindo envio apenas via HTTPS em produção.
- **Rate limiting** básico por IP nas rotas de login e cadastro (5 tentativas por minuto), mitigando ataques de força bruta.
- **Middleware de proteção de rotas**, bloqueando acesso ao `/dashboard` sem sessão válida.
- **Mensagens de erro genéricas no login**, evitando enumeração de e-mails cadastrados.

---

## 📁 Estrutura do projeto

```
src/
├── app/
│   ├── api/auth/
│   │   ├── register/route.ts   → Endpoint de cadastro
│   │   ├── login/route.ts      → Endpoint de login
│   │   └── logout/route.ts     → Endpoint de logout
│   ├── dashboard/
│   │   ├── page.tsx            → Página protegida (área logada)
│   │   └── logout-button.tsx   → Botão de logout (client component)
│   ├── login/page.tsx          → Formulário de login
│   ├── register/page.tsx       → Formulário de cadastro
│   ├── layout.tsx              → Layout raiz da aplicação
│   ├── page.tsx                → Redireciona para /login ou /dashboard
│   └── globals.css             → Estilos globais (Tailwind)
├── lib/
│   ├── prisma.ts                → Instância singleton do Prisma Client
│   ├── auth.ts                  → Hash e verificação de senha (bcrypt)
│   ├── session.ts               → Criação/validação de JWT e cookies de sessão
│   ├── rateLimit.ts             → Rate limiting em memória por IP
│   └── validations.ts           → Schemas Zod (cadastro e login)
└── middleware.ts                → Protege rotas privadas e redireciona usuários autenticados
prisma/
└── schema.prisma                → Modelo de dados (User) e configuração do banco
```

---

## 📄 O que cada arquivo faz

### `prisma/schema.prisma`
Define o modelo `User` (id, email, senha em hash, nome, data de criação) e a conexão com o PostgreSQL via variável de ambiente `DATABASE_URL`.

### `src/lib/prisma.ts`
Cria uma única instância do Prisma Client reaproveitada entre requisições, evitando esgotar conexões com o banco em ambiente serverless.

### `src/lib/auth.ts`
Centraliza a lógica de hash (`hashPassword`) e verificação (`verifyPassword`) de senhas usando bcrypt, isolando essa responsabilidade do restante da aplicação.

### `src/lib/validations.ts`
Schemas Zod que validam os dados recebidos nos formulários de cadastro e login — exigindo e-mail válido, senha forte (maiúscula, minúscula e número) e nome dentro de limites de tamanho.

### `src/lib/rateLimit.ts`
Implementa um limitador de requisições simples em memória, controlando quantas tentativas de login/cadastro um mesmo IP pode fazer por minuto.

### `src/lib/session.ts`
Responsável por criar e verificar o token JWT da sessão, além de definir e remover o cookie `HttpOnly`/`Secure` que mantém o usuário autenticado.

### `src/middleware.ts`
Intercepta requisições antes de chegarem às páginas: redireciona para `/login` quem tenta acessar `/dashboard` sem sessão, e redireciona para `/dashboard` quem já está logado e tenta acessar `/login` ou `/register`.

### `src/app/api/auth/register/route.ts`
Recebe os dados de cadastro, valida com Zod, verifica duplicidade de e-mail, gera o hash da senha, cria o usuário no banco e já inicia a sessão (login automático pós-cadastro).

### `src/app/api/auth/login/route.ts`
Valida as credenciais, busca o usuário pelo e-mail, compara a senha com o hash salvo e, se válida, cria a sessão e o cookie.

### `src/app/api/auth/logout/route.ts`
Remove o cookie de sessão, efetivamente desautenticando o usuário.

### `src/app/register/page.tsx` e `src/app/login/page.tsx`
Formulários client-side com validação básica no navegador, que chamam as respectivas rotas de API e redirecionam para o dashboard em caso de sucesso.

### `src/app/dashboard/page.tsx`
Server Component que verifica a sessão no servidor antes de renderizar, busca os dados do usuário logado no banco e exibe as informações da conta.

### `src/app/dashboard/logout-button.tsx`
Botão client-side que chama a rota de logout e redireciona o usuário de volta para o login.

---

## ⚙️ Como rodar localmente

```bash
npm install

# crie um arquivo .env com:
# DATABASE_URL="sua-connection-string-do-postgres"
# JWT_SECRET="uma-string-aleatoria-longa"

npx prisma migrate dev --name init
npm run dev
```

Acesse `http://localhost:3000`.

---

## 🚀 Deploy

Projeto hospedado na **Vercel**, com banco PostgreSQL na **Neon**. Cada push na branch `main` aciona um novo deploy automaticamente.
