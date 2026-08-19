-- ============================================================
-- DATA.SQL - Dados iniciais do HOTELWEB
-- ============================================================

-- Usuário ADMIN (senha: 123456)
INSERT INTO usuario (ativo, cpf, email, nome, papel, senha_hash, id) 
VALUES (
    true, 
    '12345678901', 
    'admin@hotelweb.com', 
    'Administrador', 
    'ADMIN', 
    '$2a$10$4V.p5B12F7QE6hD2Y2kYE.Nj3tMT4jX79m/7.8pE92R9W1Z.gN5O6', 
    default
);

-- Usuário Recepcionista (senha: 123456)
INSERT INTO usuario (ativo, cpf, email, nome, papel, senha_hash, id) 
VALUES (
    true, 
    '98765432100', 
    'joao@hotelweb.com', 
    'João Silva', 
    'RECEPCIONISTA', 
    '$2a$10$4V.p5B12F7QE6hD2Y2kYE.Nj3tMT4jX79m/7.8pE92R9W1Z.gN5O6', 
    default
);

-- Usuário Governança (senha: 123456)
INSERT INTO usuario (ativo, cpf, email, nome, papel, senha_hash, id) 
VALUES (
    true, 
    '45678912300', 
    'maria@hotelweb.com', 
    'Maria Oliveira', 
    'GOVERNANCA', 
    '$2a$10$4V.p5B12F7QE6hD2Y2kYE.Nj3tMT4jX79m/7.8pE92R9W1Z.gN5O6', 
    default
);

-- Usuário Manutenção (senha: 123456)
INSERT INTO usuario (ativo, cpf, email, nome, papel, senha_hash, id) 
VALUES (
    true, 
    '78912345600', 
    'carlos@hotelweb.com', 
    'Carlos Souza', 
    'MANUTENCAO', 
    '$2a$10$4V.p5B12F7QE6hD2Y2kYE.Nj3tMT4jX79m/7.8pE92R9W1Z.gN5O6', 
    default
);