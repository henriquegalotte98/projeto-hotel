package br.com.jprog.hotel.model.enums;

/** Representa a situação de uso de um quarto. */
public enum StatusOcupacao {
    /** Quarto livre para receber uma hospedagem. */
    DISPONIVEL,
    /** Quarto atualmente utilizado por um hóspede. */
    OCUPADO,
    /** Quarto indisponível durante uma manutenção. */
    MANUTENCAO
}
