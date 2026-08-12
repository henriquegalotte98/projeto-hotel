package br.com.jprog.hotel.model.enums;

/** Representa o estágio atual da limpeza de um quarto. */
public enum StatusLimpeza {
    /** Quarto aguardando o início da limpeza. */
    SUJO,
    /** Quarto sendo higienizado pela equipe de governança. */
    EM_LIMPEZA,
    /** Limpeza concluída, ainda sujeita à inspeção. */
    LIMPO,
    /** Quarto limpo, inspecionado e liberado. */
    INSPECIONADO
}
