-- ============================================================
-- PasseportTrack - Donnees de demonstration (utilisateurs + passeports)
-- A executer APRES schema.sql
-- Mots de passe en clair (avant hash) : voir README.md
-- ============================================================
USE passeporttrack;

INSERT INTO users (nom, prenom, email, telephone, service, role, password, actif) VALUES ('Mabiala', 'Jean', 'admin@passeporttrack.cg', '+242060000001', 'Direction Generale', 'super_admin', '$2a$10$v04wrCVMHxztrFoTgYGIWuerbteYMw41OvceO49JGUAlFSaOfoS6S', TRUE);
INSERT INTO users (nom, prenom, email, telephone, service, role, password, actif) VALUES ('Nkounkou', 'Sylvie', 'enrolement@passeporttrack.cg', '+242060000002', 'Enrolement', 'enrolement', '$2a$10$m4I./rMVyGQudPmQlLI9DusV9Gkcxi5ynv7DaaBkjDiHcqV3M0BHC', TRUE);
INSERT INTO users (nom, prenom, email, telephone, service, role, password, actif) VALUES ('Bemba', 'Patrick', 'production@passeporttrack.cg', '+242060000003', 'Production', 'production', '$2a$10$wTFw.G0B1yvsWyEbyNvUMO2PJCDf4FP8k5qAyIwn22pxS8f7eqpOy', TRUE);
INSERT INTO users (nom, prenom, email, telephone, service, role, password, actif) VALUES ('Loubassou', 'Ange', 'produit@passeporttrack.cg', '+242060000004', 'Controle', 'produit', '$2a$10$12hF4J9CXhJnjIQ2IG1Ib.kL0wkWDkriY82mC3aHnGZRE288zGJNS', TRUE);
INSERT INTO users (nom, prenom, email, telephone, service, role, password, actif) VALUES ('Tchicaya', 'Grace', 'quarantaine@passeporttrack.cg', '+242060000005', 'Quarantaine', 'quarantaine', '$2a$10$/am9uO62sAmAMQ5PuAbZqubvP7IXG3GC9tgshc0Yh3vro16.yqWFS', TRUE);
INSERT INTO users (nom, prenom, email, telephone, service, role, password, actif) VALUES ('Massamba', 'Eudes', 'reception@passeporttrack.cg', '+242060000006', 'Reception et Plaintes', 'reception_plaintes', '$2a$10$8KoxQfWK.hYm7kATOuZP8uWQ55qxK8GrvYYBD0w1DOuUWvaorQ0dm', TRUE);

-- ------------------------------------------------------------
-- Passeports de demonstration
-- ------------------------------------------------------------
INSERT INTO passports (numero_passeport, nom, prenoms, sexe, date_naissance, date_enrolement, statut) VALUES
  ('PCG-2026-100001', 'Obami', 'Pierre', 'M', '1990-04-12', CURDATE(), 'enrole'),
  ('PCG-2026-100002', 'Mouanga', 'Aline', 'F', '1988-09-23', CURDATE(), 'en_production'),
  ('PCG-2026-100003', 'Samba', 'David', 'M', '1995-01-05', CURDATE(), 'produit');

INSERT INTO passports (numero_passeport, nom, prenoms, sexe, date_naissance, date_enrolement, statut, motif_quarantaine) VALUES
  ('PCG-2026-100004', 'Kimbembe', 'Olga', 'F', '1992-07-30', CURDATE(), 'quarantaine', 'Photo non conforme');

INSERT INTO passports (numero_passeport, nom, prenoms, sexe, date_naissance, date_enrolement, statut) VALUES
  ('PCG-2026-100005', 'Ngoma', 'Hugo', 'M', '1985-11-15', CURDATE(), 'pret_a_livrer');

INSERT INTO passports (numero_passeport, nom, prenoms, sexe, date_naissance, date_enrolement, statut, date_livraison, agent_livraison, destinataire) VALUES
  ('PCG-2026-100006', 'Bakala', 'Chantal', 'F', '1998-03-02', CURDATE(), 'livre', NOW(), 'Massamba Eudes', 'Bakala Chantal');
