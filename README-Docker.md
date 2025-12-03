# Docker Setup - To-Do List

Este projeto está configurado para executar completamente com Docker e Docker Compose.

## Pré-requisitos

- Docker
- Docker Compose

## Configuração

1. Crie um arquivo `.env` na raiz do projeto (opcional, valores padrão serão usados):

```env
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=todolist
DB_PORT=5432
```

## Executando a aplicação

### Iniciar todos os serviços

```bash
docker-compose up -d
```

### Ver logs

```bash
# Ver todos os logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Parar os serviços

```bash
docker-compose down
```

### Parar e remover volumes (limpar dados do banco)

```bash
docker-compose down -v
```

### Rebuild das imagens

```bash
docker-compose up -d --build
```

## Acessando a aplicação

- **Frontend**: http://localhost (porta 80)
- **Backend API**: http://localhost:3000
- **Banco de dados**: localhost:5432

## Estrutura dos serviços

- **db**: PostgreSQL 15 (banco de dados)
- **backend**: API Node.js/Express (porta 3000)
- **frontend**: React + Vite buildado e servido com Nginx (porta 80)

## Desenvolvimento

Para desenvolvimento local sem Docker, execute os serviços manualmente conforme instruções no projeto.
