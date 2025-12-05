# Use a imagem oficial do Node.js como base
FROM node:18-alpine

# Instala o bash, postgresql-client, dos2unix e ferramentas de build necessárias para bcrypt
RUN apk add --no-cache bash postgresql-client python3 make g++ dos2unix

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências (incluindo devDependencies para sequelize-cli)
RUN npm ci

# Copia o código fonte da aplicação
COPY . .

# Normaliza fim de linha do script e torna executável
RUN dos2unix start.sh && chmod +x start.sh

# Expõe a porta que a aplicação usa
EXPOSE 3000

# Define variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar a aplicação (executa migrations e inicia servidor)
CMD ["./start.sh"]

