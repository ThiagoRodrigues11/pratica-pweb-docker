# 🚀 Tutorial Auto-Guiado: Deploy de uma To-Do List com Docker e Compose (via Play with Docker)

## 🎯 Objetivo
Aprender a executar uma aplicação **full stack (frontend + backend + banco)** usando apenas o navegador, através do **Play with Docker**, com uso de **Dockerfile** e **docker-compose**.

---

## 🧱 0) Preparação do ambiente
1. Acesse **https://labs.play-with-docker.com/**
2. Clique em **“Start”** e depois em **“+ Add new instance”**
3. Verifique o Docker:
   ```bash
   docker --version
   ```

---

## 🧩 1) Clonar um repositório público
```bash
https://github.com/paulohenriq/pratica-pweb-docker
```
---

### 2) Criar o `Dockerfile` do backend
```Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm i --omit=dev
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

### 3) `Dockerfile` do frontend
```Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm i
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### `nginx.conf`
```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location /api/ {
    proxy_pass http://backend:3000/;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## 🐘 4) Criar o `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: todos
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d todos"]
      interval: 5s
      timeout: 3s
      retries: 10

  backend:
    build: ./backend
    environment:
      DB_HOST: db
      DB_PORT: 5432
      DB_USER: postgres
      DB_PASSWORD: postgres
      DB_NAME: todos
      PORT: 3000
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  pgdata:
```

---

## 🚀 5) Subir o ambiente

```bash
docker compose build
docker compose up -d
docker compose ps
```

Depois clique em **OPEN PORT → 80** no topo do Play with Docker.  
Você verá o **frontend da To-Do List** funcionando.

---

## 🧠 6) Como os serviços se comunicam

| Serviço | Porta interna | Função |
|----------|---------------|--------|
| `frontend` | 80 | Servido pelo Nginx e faz proxy para `/api` |
| `backend` | 3000 | API Node.js + Express |
| `db` | 5432 | Banco de dados PostgreSQL |

Todos estão na mesma **network do compose**, usando **DNS interno**.

---

## 🧾 Conclusão
Parabéns! 🎉  
Você acabou de subir uma aplicação completa **frontend + backend + banco de dados** apenas com **Docker e Compose**.

