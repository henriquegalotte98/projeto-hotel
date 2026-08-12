package br.com.jprog.hotel.repository;

import br.com.jprog.hotel.model.SolicitacaoManutencao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/** Contrato de persistência das solicitações de manutenção. */
public interface ManutencaoRepository extends JpaRepository<SolicitacaoManutencao, Long> {
    /** Retorna o histórico de um quarto, priorizando os chamados mais recentes. */
    List<SolicitacaoManutencao> findByQuartoIdOrderByAbertaEmDesc(Long quartoId);
}
