package br.com.jprog.hotel.repository;

import br.com.jprog.hotel.model.SolicitacaoManutencao;
import br.com.jprog.hotel.model.enums.StatusManutencao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Contrato de persistencia das solicitacoes de manutencao. */
public interface ManutencaoRepository extends JpaRepository<SolicitacaoManutencao, Long> {
    List<SolicitacaoManutencao> findByQuartoIdOrderByAbertaEmDesc(Long quartoId);
    List<SolicitacaoManutencao> findByStatus(StatusManutencao status);
    long countByStatus(StatusManutencao status);
}
