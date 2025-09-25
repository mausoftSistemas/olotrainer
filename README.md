# OloTrainer - Plataforma de Entrenamiento Deportivo

Una plataforma completa para entrenadores y atletas que facilita la gestión de entrenamientos, seguimiento de progreso y comunicación efectiva.

## 🚀 Características

### Para Entrenadores
- **Dashboard Completo**: Vista general de atletas y métricas
- **Gestión de Atletas**: Administración completa de perfiles
- **Planificación de Entrenamientos**: Herramientas avanzadas de programación
- **Seguimiento de Progreso**: Análisis detallado del rendimiento
- **Sistema de Feedback**: Comunicación directa con atletas

### Para Atletas
- **Dashboard Personal**: Vista de entrenamientos y progreso
- **Registro de Actividades**: Logging detallado de sesiones
- **Seguimiento de Métricas**: Visualización de progreso
- **Comunicación**: Feedback directo con entrenadores

## 🛠️ Tecnologías

### Frontend
- **React 18** con TypeScript
- **Vite** para desarrollo y build
- **Tailwind CSS** para estilos
- **Zustand** para gestión de estado
- **React Router** para navegación
- **React Hook Form** + **Zod** para formularios
- **Heroicons** para iconografía

### Backend
- **Node.js** con Express
- **TypeScript** para tipado
- **Prisma** como ORM
- **PostgreSQL** como base de datos
- **Redis** para caché y sesiones
- **JWT** para autenticación

## 📦 Estructura del Proyecto

```
main/
├── frontend/          # Aplicación React
├── backend/           # API Node.js
├── docker-compose.yml # Configuración Docker
├── .env.example       # Variables de entorno
└── README.md         # Este archivo
```

## 🚀 Despliegue en EasyPanel

### 1. Preparación del Repositorio

1. Clona o descarga este repositorio
2. Asegúrate de que todos los archivos estén en la carpeta `main/`
3. Sube el proyecto a tu repositorio de GitHub

### 2. Configuración en EasyPanel

1. **Crear Nueva Aplicación**:
   - Ve a tu panel de EasyPanel
   - Crea una nueva aplicación
   - Selecciona "Deploy from GitHub"

2. **Configurar Repositorio**:
   - Conecta tu repositorio de GitHub
   - Selecciona la rama principal (main/master)
   - Establece la carpeta raíz como `main/`

3. **Variables de Entorno**:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://user:password@host:5432/database
   JWT_SECRET=your-production-secret-key
   REDIS_URL=redis://host:6379
   CORS_ORIGIN=https://tu-dominio.com
   VITE_API_URL=https://tu-api-domain.com
   ```

4. **Configurar Servicios**:
   - **Base de Datos**: PostgreSQL
   - **Caché**: Redis
   - **Frontend**: Puerto 3000
   - **Backend**: Puerto 8000

### 3. Dockerfile para EasyPanel

El proyecto incluye Dockerfiles optimizados para cada servicio:

- `frontend/Dockerfile`: Build de producción con Nginx
- `backend/Dockerfile`: API Node.js con PM2

### 4. Comandos de Build

```bash
# Frontend
cd frontend
npm install
npm run build

# Backend
cd backend
npm install
npm run build
```

## 🔧 Desarrollo Local

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- Redis

### Instalación

1. **Clonar repositorio**:
   ```bash
   git clone https://github.com/mausoftSistemas/olotrainer.git
   cd olotrainer/main
   ```

2. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

3. **Instalar dependencias**:
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   ```

4. **Ejecutar en desarrollo**:
   ```bash
   # Frontend (puerto 3000)
   cd frontend
   npm run dev
   
   # Backend (puerto 8000)
   cd backend
   npm run dev
   ```

## 🐳 Docker

Para ejecutar con Docker:

```bash
# Desarrollo
docker-compose up -d postgres redis

# Producción
docker-compose --profile production up -d
```

## 📝 Notas de Despliegue

1. **Seguridad**: Cambia todas las claves secretas en producción
2. **Base de Datos**: Configura backups automáticos
3. **SSL**: Habilita HTTPS en producción
4. **Monitoreo**: Configura logs y métricas
5. **Escalabilidad**: Considera load balancing para alto tráfico

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 📞 Soporte

Para soporte técnico o consultas:
- Email: soporte@mausoft.com
- GitHub Issues: [Crear Issue](https://github.com/mausoftSistemas/olotrainer/issues)