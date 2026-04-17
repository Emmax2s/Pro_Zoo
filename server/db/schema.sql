CREATE DATABASE IF NOT EXISTS pro_zoo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pro_zoo;

CREATE TABLE IF NOT EXISTS species (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  scientific_name VARCHAR(160) NOT NULL,
  conservation_status ENUM('No Amenazado', 'Vulnerable', 'En Peligro') NOT NULL,
  activity_pattern ENUM('Diurno', 'Nocturno', 'Crepuscular') DEFAULT 'Diurno',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS species_content (
  species_id VARCHAR(64) NOT NULL,
  lang ENUM('es', 'en') NOT NULL,
  name VARCHAR(160) NOT NULL,
  habitat VARCHAR(220) NOT NULL,
  description TEXT NULL,
  diet VARCHAR(255) NULL,
  lifespan VARCHAR(255) NULL,
  size_text VARCHAR(255) NULL,
  weight_text VARCHAR(255) NULL,
  importance_text TEXT NULL,
  distribution_text VARCHAR(255) NULL,
  threats_json JSON NULL,
  fun_facts_json JSON NULL,
  PRIMARY KEY (species_id, lang),
  CONSTRAINT fk_species_content_species
    FOREIGN KEY (species_id) REFERENCES species(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS species_media (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  species_id VARCHAR(64) NOT NULL,
  media_type ENUM('image', 'video', 'audio') NOT NULL,
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_species_media_species
    FOREIGN KEY (species_id) REFERENCES species(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS site_content (
  content_key VARCHAR(120) PRIMARY KEY,
  content_value JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
