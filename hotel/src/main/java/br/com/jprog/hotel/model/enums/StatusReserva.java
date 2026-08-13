package br.com.jprog.hotel.model.enums;

/**
 * Enumeração que representa os possíveis status
 * de uma reserva no sistema do hotel.
 */
public enum StatusReserva {

    /** Reserva criada e confirmada, aguardando a chegada do hóspede. */
    RESERVADA,

    /** Hóspede realizou o check-in e a hospedagem foi iniciada. */
    CHECKIN,

    /** Hospedagem foi encerrada e a reserva foi finalizada. */
    FINALIZADA,

    /** Reserva foi cancelada e não será realizada. */
    CANCELADA
}
