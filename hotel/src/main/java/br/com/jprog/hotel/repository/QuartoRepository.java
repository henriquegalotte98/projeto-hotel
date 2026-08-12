package br.com.jprog.hotel.repository;

import br.com.jprog.hotel.model.Quarto;
import br.com.jprog.hotel.model.enums.StatusLimpeza;
import br.com.jprog.hotel.model.enums.StatusOcupacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Contrato de persistência dos quartos.
 *
 * <p>Os nomes dos métodos seguem as convenções do Spring Data JPA, que
 * gera automaticamente as consultas a partir das propriedades da entidade.</p>
 */
public interface QuartoRepository extends JpaRepository<Quarto, Long> {
    /** Localiza quartos pelo status atual de ocupação. */
    List<Quarto> findByStatusOcupacao(StatusOcupacao statusOcupacao);

    /** Localiza quartos pelo status atual de limpeza. */
    List<Quarto> findByStatusLimpeza(StatusLimpeza statusLimpeza);

    /** Informa se o número indicado já pertence a algum quarto. */
    boolean existsByNumero(Integer numero);
}
