package br.com.jprog.hotel.service;

import br.com.jprog.hotel.exception.RecursoNaoEncontradoException;
import br.com.jprog.hotel.model.SolicitacaoManutencao;
import br.com.jprog.hotel.model.enums.StatusManutencao;
import br.com.jprog.hotel.repository.ManutencaoRepository;
import br.com.jprog.hotel.repository.QuartoRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;

/** Centraliza as regras de negócio das solicitações de manutenção. */
@Service
public class ManutencaoService {

    private final ManutencaoRepository repository;
    private final QuartoRepository quartos;
    private final Clock clock;

    @Autowired
    public ManutencaoService(ManutencaoRepository repository, QuartoRepository quartos) {
        this(repository, quartos, Clock.systemDefaultZone());
    }

    ManutencaoService(ManutencaoRepository repository, QuartoRepository quartos, Clock clock) {
        this.repository = repository;
        this.quartos = quartos;
        this.clock = clock;
    }

    /** Abre um chamado com status inicial e data controlados pelo serviço. */
    @Transactional
    public SolicitacaoManutencao abrir(SolicitacaoManutencao solicitacao) {
        if (!quartos.existsById(solicitacao.getQuartoId())) {
            throw new RecursoNaoEncontradoException(
                    "Quarto não encontrado: " + solicitacao.getQuartoId());
        }
        solicitacao.setId(null);
        solicitacao.setStatus(StatusManutencao.ABERTA);
        solicitacao.setAbertaEm(LocalDateTime.now(clock));
        solicitacao.setConcluidaEm(null);
        return repository.save(solicitacao);
    }

    /** Lista todos os chamados cadastrados. */
    @Transactional(readOnly = true)
    public List<SolicitacaoManutencao> listar() {
        return repository.findAll();
    }

    /** Busca um chamado pelo identificador ou informa sua ausência. */
    @Transactional(readOnly = true)
    public SolicitacaoManutencao buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException(
                        "Solicitação de manutenção não encontrada: " + id));
    }

    /** Retorna o histórico de chamados vinculados ao quarto informado. */
    @Transactional(readOnly = true)
    public List<SolicitacaoManutencao> historicoQuarto(Long quartoId) {
        return repository.findByQuartoIdOrderByAbertaEmDesc(quartoId);
    }

    /** Atualiza o status do chamado e controla sua data de conclusão. */
    @Transactional
    public SolicitacaoManutencao atualizarStatus(Long id, StatusManutencao novoStatus) {
        SolicitacaoManutencao solicitacao = buscar(id);
        solicitacao.setStatus(novoStatus);
        solicitacao.setConcluidaEm(
                novoStatus == StatusManutencao.CONCLUIDA ? LocalDateTime.now(clock) : null);
        return repository.save(solicitacao);
    }

    /** Conclui o chamado e registra o momento da conclusão. */
    @Transactional
    public SolicitacaoManutencao concluir(Long id) {
        return atualizarStatus(id, StatusManutencao.CONCLUIDA);
    }

    /** Exclui um chamado existente. */
    @Transactional
    public void excluir(Long id) {
        repository.delete(buscar(id));
    }
}
