-- HOTELWEB - Schema inicial (MySQL 8+)
-- Este arquivo cria o banco e as tabelas iniciais do sistema de gestão hoteleira.

-- Cria o banco somente quando ele ainda não existe e habilita suporte completo a Unicode.
CREATE DATABASE IF NOT EXISTS hotelweb
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE hotelweb;

-- Armazena os colaboradores que utilizarão o sistema.
-- A senha guarda apenas o hash gerado pela aplicação, nunca o texto original.
CREATE TABLE IF NOT EXISTS usuario (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    cpf CHAR(11) NOT NULL,
    email VARCHAR(150) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(30) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_usuario_cpf UNIQUE (cpf),
    CONSTRAINT uk_usuario_email UNIQUE (email)
) ENGINE = InnoDB;

-- Armazena os dados pessoais dos hóspedes responsáveis pelas reservas.
CREATE TABLE IF NOT EXISTS hospede (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(120) NOT NULL,
    cpf CHAR(11) NOT NULL,
    email VARCHAR(150),
    telefone VARCHAR(20),
    data_nascimento DATE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_hospede_cpf UNIQUE (cpf)
) ENGINE = InnoDB;

-- Representa os quartos, seus valores e seus estados operacionais atuais.
CREATE TABLE IF NOT EXISTS quarto (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    numero VARCHAR(10) NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    capacidade SMALLINT UNSIGNED NOT NULL,
    valor_diaria DECIMAL(10, 2) NOT NULL,
    status_ocupacao VARCHAR(30) NOT NULL DEFAULT 'DISPONIVEL',
    status_limpeza VARCHAR(30) NOT NULL DEFAULT 'LIMPO',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uk_quarto_numero UNIQUE (numero),
    CONSTRAINT ck_quarto_capacidade CHECK (capacidade > 0),
    CONSTRAINT ck_quarto_valor_diaria CHECK (valor_diaria >= 0)
) ENGINE = InnoDB;

-- Relaciona um hóspede a um quarto durante um período de hospedagem.
-- O valor da diária é registrado na reserva para preservar o valor contratado.
CREATE TABLE IF NOT EXISTS reserva (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    hospede_id BIGINT UNSIGNED NOT NULL,
    quarto_id BIGINT UNSIGNED NOT NULL,
    data_entrada DATE NOT NULL,
    data_saida DATE NOT NULL,
    quantidade_hospedes SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE',
    valor_diaria DECIMAL(10, 2) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_reserva_hospede FOREIGN KEY (hospede_id)
        REFERENCES hospede (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_reserva_quarto FOREIGN KEY (quarto_id)
        REFERENCES quarto (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT ck_reserva_periodo CHECK (data_saida > data_entrada),
    CONSTRAINT ck_reserva_quantidade_hospedes CHECK (quantidade_hospedes > 0),
    CONSTRAINT ck_reserva_valor_diaria CHECK (valor_diaria >= 0),
    INDEX idx_reserva_hospede (hospede_id),
    INDEX idx_reserva_quarto_periodo (quarto_id, data_entrada, data_saida),
    INDEX idx_reserva_status (status)
) ENGINE = InnoDB;

-- Registra solicitações de manutenção associadas a um quarto.
-- O usuário responsável é opcional e pode ser definido após a abertura.
CREATE TABLE IF NOT EXISTS manutencao (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    quarto_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED,
    descricao VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ABERTA',
    prioridade VARCHAR(20) NOT NULL DEFAULT 'MEDIA',
    aberta_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    concluida_em TIMESTAMP NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_manutencao_quarto FOREIGN KEY (quarto_id)
        REFERENCES quarto (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT fk_manutencao_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuario (id) ON UPDATE RESTRICT ON DELETE SET NULL,
    CONSTRAINT ck_manutencao_conclusao CHECK (concluida_em IS NULL OR concluida_em >= aberta_em),
    INDEX idx_manutencao_quarto (quarto_id),
    INDEX idx_manutencao_usuario (usuario_id),
    INDEX idx_manutencao_status (status)
) ENGINE = InnoDB;

-- Registra produtos ou serviços adicionais consumidos durante uma reserva.
CREATE TABLE IF NOT EXISTS consumo_extra (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    reserva_id BIGINT UNSIGNED NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    quantidade SMALLINT UNSIGNED NOT NULL DEFAULT 1,
    valor_unitario DECIMAL(10, 2) NOT NULL,
    consumido_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_consumo_extra_reserva FOREIGN KEY (reserva_id)
        REFERENCES reserva (id) ON UPDATE RESTRICT ON DELETE RESTRICT,
    CONSTRAINT ck_consumo_extra_quantidade CHECK (quantidade > 0),
    CONSTRAINT ck_consumo_extra_valor_unitario CHECK (valor_unitario >= 0),
    INDEX idx_consumo_extra_reserva (reserva_id)
) ENGINE = InnoDB;
