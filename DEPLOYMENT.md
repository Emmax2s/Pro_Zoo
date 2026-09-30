# Instrucciones de Deployment para Pro Zoo - pruzo.me

## Paso 1: Clonar el repositorio en tu servidor

```bash
cd /var/www/
git clone https://github.com/Emmax2s/Pro_Zoo.git
cd Pro_Zoo
npm install
```

---

## Paso 2: Crear archivo `.env` en el servidor

Crea un archivo `.env` en la raíz del proyecto `/var/www/Pro_Zoo/.env`:

```env
# Frontend
VITE_API_BASE_URL=https://pruzo.me

# Backend
PORT=4000

# PostgreSQL Configuration
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=AQUI_TU_CONTRASEÑA_POSTGRES
POSTGRES_DATABASE=pro_zoo

# Admin & Security (CAMBIAR ESTOS VALORES!)
ADMIN_API_KEY=zoomat-admin-pruzo-2026
CORS_ORIGIN=https://pruzo.me
JWT_SECRET=super-secret-pruzo-2026-CAMBIAR-ESTO
```

⚠️ **IMPORTANTE:** 
- Reemplaza `AQUI_TU_CONTRASEÑA_POSTGRES` con una contraseña segura
- Genera claves aleatorias fuertes para `ADMIN_API_KEY` y `JWT_SECRET`
- NO compartas este archivo

---

## Paso 3: Configurar PostgreSQL en el servidor

Ejecuta estos comandos como usuario `postgres`:

```bash
sudo -u postgres psql
```

Luego en psql, ejecuta:

```sql
-- Crear la base de datos
CREATE DATABASE pro_zoo;

-- Conectarse a la BD
\c pro_zoo

-- Crear tabla de especies
CREATE TABLE species (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  species_name VARCHAR(100),
  description TEXT,
  image_url VARCHAR(500),
  habitat VARCHAR(100),
  diet VARCHAR(100),
  status VARCHAR(50),
  conservation_status VARCHAR(50),
  size VARCHAR(100),
  weight VARCHAR(100),
  activity VARCHAR(50),
  distribution VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios admin
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de contenido del sitio (opcional)
CREATE TABLE site_content (
  id SERIAL PRIMARY KEY,
  content_key VARCHAR(100) UNIQUE NOT NULL,
  content_value JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Salir
\q
```

---

## Paso 4: Iniciar el servidor

### Opción A: Ejecución manual
```bash
cd /var/www/Pro_Zoo
node server/index.js
```

### Opción B: Con PM2 (Recomendado - ejecución persistente)
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar la aplicación
pm2 start server/index.js --name "pro-zoo-api"

# Guardar la configuración para que reinicie automáticamente
pm2 save
pm2 startup

# Ver logs
pm2 logs pro-zoo-api
```

---

## Paso 5: Configurar Nginx (Reverse Proxy)

Crea un archivo de configuración Nginx en `/etc/nginx/sites-available/pruzo.me`:

```nginx
upstream pro_zoo_backend {
    server 127.0.0.1:4000;
}

server {
    listen 80;
    server_name pruzo.me www.pruzo.me;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name pruzo.me www.pruzo.me;

    ssl_certificate /etc/letsencrypt/live/pruzo.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pruzo.me/privkey.pem;

    # API Backend
    location /api {
        proxy_pass http://pro_zoo_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend (React/Vite)
    location / {
        root /var/www/Pro_Zoo/build;
        try_files $uri $uri/ /index.html;
    }
}
```

Habilita la configuración:
```bash
sudo ln -s /etc/nginx/sites-available/pruzo.me /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Paso 6: Build del Frontend

```bash
cd /var/www/Pro_Zoo
npm run build
```

Los archivos compilados estarán en `/build/`

---

## Verificación

```bash
# Ver si el servidor está corriendo
curl http://localhost:4000/api/health

# Debería retornar:
# {"status":"ok","database":"connected"}
```

---

## Troubleshooting

**Error: "database disconnected"**
- Verifica que PostgreSQL esté corriendo: `sudo systemctl status postgresql`
- Verifica credenciales en `.env`
- Verifica que la BD `pro_zoo` existe

**Error: "Port 4000 already in use"**
```bash
sudo lsof -i :4000
# Mata el proceso si es necesario
sudo kill -9 <PID>
```

**Logs de PM2**
```bash
pm2 logs pro-zoo-api
```

---

**¡Listo! Tu Pro Zoo API está en línea en https://pruzo.me** 🦁🚀
