package br.com.jprog.hotel.model.enums;

/** Representa a situação atual de uma solicitação de manutenção. */
public enum StatusManutencao {
    /** Chamado registrado e aguardando atendimento. */
    ABERTA,
    /** Chamado em atendimento pela equipe responsável. */
    EM_ANDAMENTO,
    /** Serviço de manutenção finalizado. */
    CONCLUIDA,
    /** Chamado cancelado antes de sua conclusão. */
    CANCELADA
}
