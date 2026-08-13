package br.com.jprog.hotel.model.enums;

/**
 * Representa a situação de uso de um quarto no hotel.
 */
public enum StatusOcupacao {

    /** Quarto livre para receber uma nova hospedagem. */
    DISPONIVEL,

    /** Quarto ocupado por um hóspede. */
    OCUPADO,

    /** Quarto temporariamente indisponível por manutenção. */
    MANUTENCAO
}
