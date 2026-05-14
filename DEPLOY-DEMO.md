# Deploy demo gratuito

Este projeto esta preparado para uma demo com:

- Vercel: frontend React
- Render: API Node/Express
- Supabase ou Neon: PostgreSQL

## 1. Banco PostgreSQL

Crie um projeto gratuito no Supabase ou Neon e copie a connection string PostgreSQL.

Use a string em formato `DATABASE_URL`, por exemplo:

```txt
postgresql://usuario:senha@host:5432/database?sslmode=require
```

## 2. API no Render

No Render, crie um **Blueprint** ou **Web Service** a partir do repositorio GitHub.

Se usar Blueprint, o Render le o arquivo `render.yaml`.

Variaveis obrigatorias:

```txt
DATABASE_URL=sua_url_do_postgres
WEB_ORIGIN=https://seu-app.vercel.app
```

O `JWT_SECRET` pode ser gerado automaticamente pelo Render se usar o Blueprint.

Build command:

```bash
npm install && npm run build && npm run deploy:seed
```

Start command:

```bash
npm start
```

Depois do deploy, a API deve responder em:

```txt
https://sua-api.onrender.com/health
```

## 3. Frontend na Vercel

Importe o repositorio GitHub na Vercel.

Configuracao:

```txt
Framework: Vite
Build Command: npm --workspace web run build
Output Directory: web/dist
Install Command: npm install
```

Variavel obrigatoria:

```txt
VITE_API_URL=https://sua-api.onrender.com
```

## 4. Ajustar CORS

Depois que a Vercel gerar a URL final, volte no Render e configure:

```txt
WEB_ORIGIN=https://sua-url-da-vercel.vercel.app
```

Depois rode um novo deploy da API.

## 5. Login demo

O seed cria o usuario:

```txt
admin@fruitshow.com.br
admin123
```

## Observacoes

- Render Free pode dormir depois de inatividade; o primeiro acesso pode demorar.
- Supabase Free pode pausar projeto sem uso.
- Esta configuracao e ideal para demonstracao, nao para operacao real em producao.
