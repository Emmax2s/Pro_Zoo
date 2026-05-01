

# Pro Zoo - Sistema de Gestión de Zoológico

Aplicación full-stack para gestionar información de especies y contenido de un zoológico.

## 🚀 Características

- ✅ Panel de administración para especies
- ✅ API REST con PostgreSQL
- ✅ Autenticación JWT
- ✅ Frontend React con Vite
- ✅ Responsive design
- ✅ Soporte multiidioma (ES/EN)

## 💻 Desarrollo Local

### Requisitos
- Node.js 18+
- PostgreSQL 12+
- npm o yarn

### Instalación

1. Instala dependencias:
```bash
npm install
```

2. Crea un archivo `.env` en la raíz:
```bash
cp .env.example .env
```

3. Crea la base de datos PostgreSQL:
```bash
psql -U postgres -d pro_zoo -f server/db/init.sql
```

4. Levanta el entorno de desarrollo:
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

5. En otra terminal, inicia el servidor backend:
```bash
node server/index.js
```

## 🏗️ Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en `/build/`

## 📦 Deployment

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para instrucciones completas de despliegue en producción (pruzo.me).

**Pasos rápidos:**
1. Clonar repositorio en servidor
2. Crear archivo `.env` con credenciales
3. Ejecutar script SQL: `psql -U postgres -d pro_zoo -f server/db/init.sql`
4. Instalar dependencias: `npm install`
5. Iniciar con PM2: `pm2 start server/index.js`

## 📋 API Endpoints

### Especies
- `GET /api/species` - Listar especies
- `GET /api/species/:id` - Obtener especie
- `POST /api/species` - Crear especie (requiere admin key)
- `PUT /api/species/:id` - Actualizar especie (requiere admin key)
- `DELETE /api/species/:id` - Eliminar especie (requiere admin key)

### Admin
- `POST /api/admin/login` - Login
- `POST /api/admin/create` - Crear usuario (requiere token)
- `GET /api/admin/list` - Listar usuarios (requiere token)

### Health Check
- `GET /api/health` - Estado de la API y BD

## 📝 Variables de Entorno

Ver `.env.example` y `.env.production.example` para todas las variables disponibles.

## 🤝 Autor

Emmax (https://github.com/Emmax2s)

---

**Dominio:** https://pruzo.me

