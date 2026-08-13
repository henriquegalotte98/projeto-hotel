package br.com.jprog.hotel.service;

import br.com.jprog.hotel.exception.RecursoNaoEncontradoException;
import br.com.jprog.hotel.model.SolicitacaoManutencao;
import br.com.jprog.hotel.model.enums.StatusManutencao;
import br.com.jprog.hotel.repository.ManutencaoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Testa as regras centrais do serviço de manutenção. */
class ManutencaoServiceTest {

    private ManutencaoRepository repository;
    private ManutencaoService service;
    private SolicitacaoManutencao solicitacao;
    private LocalDateTime agora;

    @BeforeEach
    void preparar() {
        repository = mock(ManutencaoRepository.class);
        Clock clock = Clock.fixed(Instant.parse("2026-08-12T22:00:00Z"), ZoneOffset.UTC);
        service = new ManutencaoService(repository, clock);
        agora = LocalDateTime.of(2026, 8, 12, 22, 0);
        solicitacao = new SolicitacaoManutencao();
        solicitacao.setId(1L);
        solicitacao.setDescricao("Reparo no ar-condicionado");
    }

    @Test
    void deveAbrirChamadoComEstadoInicial() {
        when(repository.save(solicitacao)).thenReturn(solicitacao);

        SolicitacaoManutencao resultado = service.abrir(solicitacao);

        assertNull(resultado.getId());
        assertEquals(StatusManutencao.ABERTA, resultado.getStatus());
        assertEquals(agora, resultado.getAbertaEm());
        assertNull(resultado.getConcluidaEm());
    }

    @Test
    void deveListarChamados() {
        when(repository.findAll()).thenReturn(List.of(solicitacao));
        assertEquals(List.of(solicitacao), service.listar());
    }

    @Test
    void deveBuscarChamadoExistente() {
        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));
        assertEquals(solicitacao, service.buscar(1L));
    }

    @Test
    void deveRejeitarBuscaDeChamadoInexistente() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(RecursoNaoEncontradoException.class, () -> service.buscar(1L));
    }

    @Test
    void deveRetornarHistoricoDoQuarto() {
        when(repository.findByQuartoIdOrderByAbertaEmDesc(10L)).thenReturn(List.of(solicitacao));
        assertEquals(List.of(solicitacao), service.historicoQuarto(10L));
    }

    @Test
    void deveAtualizarStatus() {
        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));
        when(repository.save(solicitacao)).thenReturn(solicitacao);

        SolicitacaoManutencao resultado = service.atualizarStatus(1L, StatusManutencao.EM_ANDAMENTO);

        assertEquals(StatusManutencao.EM_ANDAMENTO, resultado.getStatus());
        assertNull(resultado.getConcluidaEm());
    }

    @Test
    void deveConcluirChamadoERegistrarData() {
        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));
        when(repository.save(solicitacao)).thenReturn(solicitacao);

        SolicitacaoManutencao resultado = service.concluir(1L);

        assertEquals(StatusManutencao.CONCLUIDA, resultado.getStatus());
        assertEquals(agora, resultado.getConcluidaEm());
    }

    @Test
    void deveExcluirChamadoExistente() {
        when(repository.findById(1L)).thenReturn(Optional.of(solicitacao));
        service.excluir(1L);
        verify(repository).delete(solicitacao);
    }
}
