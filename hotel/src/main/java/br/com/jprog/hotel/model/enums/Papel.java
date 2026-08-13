package br.com.jprog.hotel.model.enums;

/**
 * Enumeração que representa os diferentes papéis
 * que um funcionário pode possuir no sistema do hotel.
 */
public enum Papel {

    /** Usuário com permissões administrativas no sistema. */
    ADMIN,

    /** Funcionário responsável pelas atividades de recepção. */
    RECEPCIONISTA,

    /** Funcionário responsável pelas atividades de governança e limpeza. */
    GOVERNANCA,

    /** Funcionário responsável pelas atividades de manutenção do hotel. */
    MANUTENCAO
}
