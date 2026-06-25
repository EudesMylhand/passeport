-- ============================================================
-- PasseportTrack - Script de creation de la base de donnees
-- Republique du Congo - Suivi de production et livraison des passeports
-- ============================================================

CREATE DATABASE IF NOT EXISTS passeporttrack
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE passeporttrack;

-- ------------------------------------------------------------
-- Table : users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telephone VARCHAR(30),
  service VARCHAR(100),
  role ENUM('super_admin','enrolement','production','produit','quarantaine','reception_plaintes')
       NOT NULL DEFAULT 'enrolement',
  password VARCHAR(255) NOT NULL,
  actif BOOLEAN NOT NULL DEFAULT TRUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : passports
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS passports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_passeport VARCHAR(50) UNIQUE,
  nom VARCHAR(100) NOT NULL,
  prenoms VARCHAR(150) NOT NULL,
  sexe ENUM('M','F') NOT NULL,
  date_naissance DATE,
  date_enrolement DATE DEFAULT (CURRENT_DATE),
  statut ENUM('enrole','en_production','produit','quarantaine','pret_a_livrer','livre','plainte_ouverte','plainte_resolue')
         NOT NULL DEFAULT 'enrole',
  motif_quarantaine TEXT,
  date_livraison DATETIME,
  agent_livraison VARCHAR(150),
  destinataire VARCHAR(150),
  qr_code_path VARCHAR(255),
  utilisateur_responsable INT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_passport_user FOREIGN KEY (utilisateur_responsable) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_passport_statut (statut),
  INDEX idx_passport_nom (nom),
  INDEX idx_passport_date_enrolement (date_enrolement)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : production_history
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS production_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  passport_id INT NOT NULL,
  ancien_statut VARCHAR(50),
  nouveau_statut VARCHAR(50),
  utilisateur VARCHAR(150),
  date_modification DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  commentaire TEXT,
  CONSTRAINT fk_history_passport FOREIGN KEY (passport_id) REFERENCES passports(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_history_passport (passport_id)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : complaints
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_dossier VARCHAR(50) UNIQUE,
  passport_id INT NOT NULL,
  description TEXT NOT NULL,
  date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  statut ENUM('ouverte','en_cours','resolue') NOT NULL DEFAULT 'ouverte',
  resolution TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_complaint_passport FOREIGN KEY (passport_id) REFERENCES passports(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_complaint_statut (statut)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : notifications
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type VARCHAR(100),
  message VARCHAR(255),
  lue BOOLEAN NOT NULL DEFAULT FALSE,
  user_id INT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Table : login_history
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  date_connexion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  date_deconnexion DATETIME,
  adresse_ip VARCHAR(60),
  navigateur VARCHAR(255),
  CONSTRAINT fk_login_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- Fin du script. Pour les donnees de demonstration (utilisateurs
-- avec mots de passe crypte bcrypt + passeports d'exemple),
-- utilisez plutot : npm run seed  (voir backend/seeders/seed.js)
-- Les mots de passe doivent etre hashes en bcrypt ; ils ne sont
-- donc pas inseres en clair dans ce script SQL.
-- ============================================================
