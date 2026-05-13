# FruitShow Ops

Sistema de operações para a rede brasileira de franquias **Açaí FruitShow**.

## Estrutura

- `api`: Node.js + Express + Prisma + PostgreSQL
- `web`: React + Vite + TailwindCSS

## Rodando localmente

1. Configure `api/.env` a partir de `api/.env.example`.
2. Instale dependências:

```bash
npm install
```

3. Gere o Prisma Client e rode as migrações:

```bash
npm run prisma:generate
npm run prisma:migrate
```

4. Inicie API e web:

```bash
npm run dev
```

API: `http://localhost:3333`  
Web: `http://localhost:5173`
