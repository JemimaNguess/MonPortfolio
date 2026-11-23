-- Ma Jemima — schéma MySQL (compatible MySQL 8+, MariaDB 10.5+ et TiDB Cloud)
-- Import : phpMyAdmin > Importer, ou : mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS ma_jemima CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ma_jemima;

-- Projets affichés dans la scène « Projets » et sur /projets/[slug]
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(120) NOT NULL UNIQUE,
  title_fr VARCHAR(200) NOT NULL,
  title_en VARCHAR(200) NOT NULL DEFAULT '',
  kicker_fr VARCHAR(200) NOT NULL DEFAULT '',
  kicker_en VARCHAR(200) NOT NULL DEFAULT '',
  summary_fr TEXT,
  summary_en TEXT,
  body_fr MEDIUMTEXT,
  body_en MEDIUMTEXT,
  category VARCHAR(40) NOT NULL DEFAULT 'web',        -- web | mobile | ia | hackathon
  tags JSON,
  image_url VARCHAR(500) NOT NULL DEFAULT '',
  github_url VARCHAR(500) NOT NULL DEFAULT '',
  demo_url VARCHAR(500) NOT NULL DEFAULT '',
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Base de connaissances de l'assistante (ce que l'IA sait de Jemima)
CREATE TABLE IF NOT EXISTS knowledge (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  lang VARCHAR(5) NOT NULL DEFAULT 'fr',
  embedding JSON NULL,                                  -- vecteur Gemini, calculé à l'enregistrement
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Clips vidéo parlants (vraie voix de Jemima) associés à une question type
CREATE TABLE IF NOT EXISTS clips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL DEFAULT '',                 -- q01, u3…
  question VARCHAR(300) NOT NULL,
  answer_text TEXT NOT NULL,                            -- sous-titres
  video_url VARCHAR(500) NOT NULL DEFAULT '',           -- /clips/q01-fr.mp4
  lang VARCHAR(5) NOT NULL DEFAULT 'fr',
  embedding JSON NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Questions posées à l'hologramme (anonymisées)
CREATE TABLE IF NOT EXISTS conversations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(64) NOT NULL DEFAULT '',
  ip_hash CHAR(64) NOT NULL DEFAULT '',
  lang VARCHAR(5) NOT NULL DEFAULT 'fr',
  question TEXT NOT NULL,
  answer TEXT,
  source VARCHAR(20) NOT NULL DEFAULT 'ai',             -- clip | ai | fallback | blocked
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conv_ip_date (ip_hash, created_at),
  INDEX idx_conv_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Messages du formulaire de contact et demandes de devis
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(200) NOT NULL,
  subject VARCHAR(200) NOT NULL DEFAULT '',
  message TEXT NOT NULL,
  meta JSON NULL,                                       -- réponses du devis guidé
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Réglages modifiables depuis l'admin
CREATE TABLE IF NOT EXISTS settings (
  name VARCHAR(80) PRIMARY KEY,
  value TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO settings (name, value) VALUES
  ('assistant_enabled', 'true'),
  ('ai_daily_limit', '800'),
  ('visitor_hourly_limit', '20'),
  ('availability_fr', 'Disponible pour de nouveaux projets.'),
  ('availability_en', 'Available for new projects.');

-- Conservation 30 jours des conversations (à lancer de temps en temps, ou via un événement MySQL) :
-- DELETE FROM conversations WHERE created_at < NOW() - INTERVAL 30 DAY;
