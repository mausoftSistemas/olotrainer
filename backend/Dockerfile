# Dockerfile para Backend - OloTrainer
# Usar registry alternativo para evitar límites de Docker Hub
FROM ghcr.io/library/node:18-alpine

# Nota: Usando GitHub Container Registry como alternativa a Docker Hub

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Comando para ejecutar la aplicación
CMD ["npm", "start"]