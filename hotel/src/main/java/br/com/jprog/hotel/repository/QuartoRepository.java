package br.com.jprog.hotel.repository;

import br.com.jprog.hotel.model.Quarto;
import br.com.jprog.hotel.model.enums.StatusLimpeza;
import br.com.jprog.hotel.model.enums.StatusOcupacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Contrato de persistencia dos quartos. */
public interface QuartoRepository extends JpaRepository<Quarto, Long> {
    boolean existsByNumero(Integer numero);
    List<Quarto> findByStatusOcupacao(StatusOcupacao status);
    List<Quarto> findByStatusLimpeza(StatusLimpeza status);
    long countByStatusOcupacao(StatusOcupacao status);
    long countByStatusLimpeza(StatusLimpeza status);
}
