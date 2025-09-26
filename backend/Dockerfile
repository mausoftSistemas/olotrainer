# Dockerfile para Backend - OloTrainer
FROM node:18-alpine

# Usar imagen oficial de Node.js con Alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies para el build)
RUN npm install

# Copiar código fuente
COPY . .

# Generar cliente Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Limpiar devDependencies después del build para reducir el tamaño de la imagen
RUN npm prune --omit=dev

# Exponer puerto
EXPOSE 3001

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3001

# Comando para ejecutar la aplicación
CMD ["npm", "start"]