package br.com.jprog.hotel.repository;

import br.com.jprog.hotel.model.Reserva;
import br.com.jprog.hotel.model.enums.StatusReserva;
import org.springframework.data.jpa.repository.JpaRepository;

/** Contrato de persistência usado para consultar reservas. */
public interface ReservaRepository extends JpaRepository<Reserva, Long> {
    /**
     * Verifica se existe uma reserva para o quarto e o status informados.
     * Essa consulta sustenta o bloqueio de exclusão aplicado pelo serviço.
     */
    boolean existsByQuartoIdAndStatus(Long quartoId, StatusReserva status);
}
