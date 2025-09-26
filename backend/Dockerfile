# Dockerfile para Backend - OloTrainer
FROM docker.mirrors.ustc.edu.cn/library/alpine:3.18

# Instalar Node.js y npm desde los repositorios de Alpine
RUN apk add --no-cache nodejs npm

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