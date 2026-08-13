package br.com.jprog.hotel.model.enums;


/**
 * Enumeração que representa os possíveis status
 * de uma solicitação de manutenção no hotel.
 */
public enum StatusManutencao {

    /** Manutenção foi aberta e ainda não foi iniciada. */
    ABERTA,

    /** Manutenção está sendo realizada pela equipe responsável. */
    EM_ANDAMENTO,

    /** Manutenção foi finalizada com sucesso. */
    CONCLUIDA
}