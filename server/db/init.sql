-- Script de inicialización de Pro Zoo Database
-- Ejecutar como: psql -U postgres -d pro_zoo -f init.sql

-- Crear tabla de especies
CREATE TABLE IF NOT EXISTS species (
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
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de contenido del sitio
CREATE TABLE IF NOT EXISTS site_content (
  id SERIAL PRIMARY KEY,
  content_key VARCHAR(100) UNIQUE NOT NULL,
  content_value JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_species_slug ON species(slug);
CREATE INDEX IF NOT EXISTS idx_species_created ON species(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);

-- Mostrar estado
\dt
\di
