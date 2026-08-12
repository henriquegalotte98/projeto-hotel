package br.com.jprog.hotel.model.enums;

/** Representa os estados atualmente reconhecidos para uma reserva. */
public enum StatusReserva {
    /** Reserva vigente; considerada ativa nas regras de quartos. */
    RESERVADA,
    /** Reserva cancelada antes da hospedagem. */
    CANCELADA,
    /** Reserva encerrada após a conclusão da hospedagem. */
    FINALIZADA
}
