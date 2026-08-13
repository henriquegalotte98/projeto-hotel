package br.com.jprog.hotel.model.enums;

/**
 * Representa o estágio atual da limpeza de um quarto.
 *
 * <p>O fluxo operacional esperado é:
 * {@code SUJO -> EM_LIMPEZA -> LIMPO -> INSPECIONADO}.</p>
 */
public enum StatusLimpeza {

    /** Quarto aguardando o início da limpeza. */
    SUJO,

    /** Quarto sendo higienizado pela equipe de governança. */
    EM_LIMPEZA,

    /** Limpeza concluída, mas ainda não inspecionada. */
    LIMPO,

    /** Quarto limpo, inspecionado e liberado pela governança. */
    INSPECIONADO
}
