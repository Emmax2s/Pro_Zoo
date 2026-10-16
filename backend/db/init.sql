-- Script de inicialización de Pro Zoo Database
-- Ejecutar como: psql -U postgres -d pro_zoo -f init.sql

-- Crear tabla de especies
CREATE TABLE IF NOT EXISTS species (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  species_name VARCHAR(100),
  category VARCHAR(50),
  enclosure_id VARCHAR(100),
  translation_cache JSONB,
  description TEXT,
  image_url VARCHAR(500),
  habitat VARCHAR(100),
  diet VARCHAR(100),
  status VARCHAR(50),
  conservation_status VARCHAR(50),
  lifespan VARCHAR(100),
  size VARCHAR(100),
  weight VARCHAR(100),
  activity VARCHAR(50),
  distribution VARCHAR(200),
  -- Campos nuevos para cumplimiento académico
  audio_description_url VARCHAR(500),
  scientific_classification JSONB DEFAULT '{"kingdom": "", "phylum": "", "class": "", "order": "", "family": "", "genus": "", "species": ""}',
  conservation_iucn VARCHAR(5) DEFAULT 'DD',
  threats JSONB DEFAULT '[]',
  ecosystem_role TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de usuarios admin
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(150),
  role VARCHAR(30) NOT NULL DEFAULT 'superadmin',
  enclosure_id VARCHAR(100),
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

CREATE TABLE IF NOT EXISTS enclosures (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color VARCHAR(50) NOT NULL DEFAULT 'bg-emerald-600',
  icon VARCHAR(100) NOT NULL DEFAULT 'Vivario',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de visitas de especies para estadísticas
CREATE TABLE IF NOT EXISTS species_visits (
  id SERIAL PRIMARY KEY,
  species_id INTEGER NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  visitor_id VARCHAR(100),
  visitor_language VARCHAR(5) DEFAULT 'es',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_seconds INTEGER DEFAULT 0,
  accessed_via VARCHAR(50) DEFAULT 'direct',
  ip_hash VARCHAR(64),
  user_agent_hash VARCHAR(64)
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_species_slug ON species(slug);
CREATE INDEX IF NOT EXISTS idx_species_created ON species(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_visits_species_id ON species_visits(species_id);
CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON species_visits(timestamp);
CREATE INDEX IF NOT EXISTS idx_visits_species_language ON species_visits(species_id, visitor_language);

-- Mostrar estado
\dt
\di
