package br.com.jprog.hotel.service;

import br.com.jprog.hotel.model.Quarto;
import br.com.jprog.hotel.model.Reserva;
import br.com.jprog.hotel.model.enums.StatusLimpeza;
import br.com.jprog.hotel.model.enums.StatusManutencao;
import br.com.jprog.hotel.model.enums.StatusOcupacao;
import br.com.jprog.hotel.model.enums.StatusReserva;
import br.com.jprog.hotel.repository.ConsumoExtraRepository;
import br.com.jprog.hotel.repository.ManutencaoRepository;
import br.com.jprog.hotel.repository.QuartoRepository;
import br.com.jprog.hotel.repository.ReservaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RelatorioServiceTest {
    @Mock ReservaRepository reservas;
    @Mock QuartoRepository quartos;
    @Mock ConsumoExtraRepository consumos;
    @Mock ManutencaoRepository manutencoes;
    private RelatorioService service;

    @BeforeEach
    void configurar() {
        service = new RelatorioService(reservas, quartos, consumos, manutencoes);
    }

    @Test
    void calculaFaturamentoEQuantidadeDeDiariasDentroDoPeriodo() {
        LocalDate inicio = LocalDate.of(2026, 8, 11);
        LocalDate fim = LocalDate.of(2026, 8, 12);
        Reserva reserva = reserva(LocalDate.of(2026, 8, 10), LocalDate.of(2026, 8, 13), "100.00");
        when(reservas.findNoPeriodo(inicio, fim)).thenReturn(List.of(reserva));
        when(consumos.totalNoPeriodo(inicio.atStartOfDay(), fim.plusDays(1).atStartOfDay().minusNanos(1)))
                .thenReturn(new BigDecimal("50.00"));

        Map<String, Object> faturamento = service.faturamento(inicio, fim);

        assertEquals(new BigDecimal("200.00"), faturamento.get("totalDiarias"));
        assertEquals(new BigDecimal("250.00"), faturamento.get("total"));
        assertEquals(2L, service.diarias(inicio, fim).get("total"));
    }

    @Test
    void ignoraReservaCanceladaNoFaturamento() {
        LocalDate inicio = LocalDate.of(2026, 8, 1);
        LocalDate fim = LocalDate.of(2026, 8, 2);
        Reserva reserva = reserva(inicio, fim.plusDays(1), "150.00");
        reserva.setStatus(StatusReserva.CANCELADA);
        when(reservas.findNoPeriodo(inicio, fim)).thenReturn(List.of(reserva));
        when(consumos.totalNoPeriodo(inicio.atStartOfDay(), fim.plusDays(1).atStartOfDay().minusNanos(1)))
                .thenReturn(BigDecimal.ZERO);

        assertEquals(BigDecimal.ZERO, service.faturamento(inicio, fim).get("total"));
    }

    @Test
    void calculaTaxaDeOcupacao() {
        when(quartos.count()).thenReturn(10L);
        when(quartos.countByStatusOcupacao(StatusOcupacao.OCUPADO)).thenReturn(4L);
        when(quartos.countByStatusOcupacao(StatusOcupacao.DISPONIVEL)).thenReturn(5L);
        when(quartos.countByStatusOcupacao(StatusOcupacao.MANUTENCAO)).thenReturn(1L);

        assertEquals(40.0, service.ocupacao().get("taxaOcupacao"));
    }

    @Test
    void resumeGovernancaEManutencao() {
        when(quartos.countByStatusLimpeza(StatusLimpeza.SUJO)).thenReturn(2L);
        when(manutencoes.countByStatus(StatusManutencao.ABERTA)).thenReturn(3L);

        assertEquals(2L, service.governanca().get("sujos"));
        assertEquals(3L, service.manutencao().get("abertas"));
    }

    private Reserva reserva(LocalDate entrada, LocalDate saida, String diaria) {
        Quarto quarto = new Quarto();
        quarto.setValorDiaria(new BigDecimal(diaria));
        Reserva reserva = new Reserva();
        reserva.setQuarto(quarto);
        reserva.setDataCheckinPrevista(entrada);
        reserva.setDataCheckoutPrevista(saida);
        reserva.setStatus(StatusReserva.RESERVADA);
        return reserva;
    }
}
