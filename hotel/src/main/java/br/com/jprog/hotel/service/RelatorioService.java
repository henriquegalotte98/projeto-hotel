package br.com.jprog.hotel.service;

import br.com.jprog.hotel.model.Reserva;
import br.com.jprog.hotel.model.enums.StatusLimpeza;
import br.com.jprog.hotel.model.enums.StatusManutencao;
import br.com.jprog.hotel.model.enums.StatusOcupacao;
import br.com.jprog.hotel.model.enums.StatusReserva;
import br.com.jprog.hotel.repository.ConsumoExtraRepository;
import br.com.jprog.hotel.repository.ManutencaoRepository;
import br.com.jprog.hotel.repository.QuartoRepository;
import br.com.jprog.hotel.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RelatorioService {
    private final ReservaRepository reservas;
    private final QuartoRepository quartos;
    private final ConsumoExtraRepository consumos;
    private final ManutencaoRepository manutencoes;

    public RelatorioService(ReservaRepository reservas, QuartoRepository quartos,
            ConsumoExtraRepository consumos, ManutencaoRepository manutencoes) {
        this.reservas = reservas;
        this.quartos = quartos;
        this.consumos = consumos;
        this.manutencoes = manutencoes;
    }

    public Map<String, Object> faturamento(LocalDate inicio, LocalDate fim) {
        validarPeriodo(inicio, fim);
        BigDecimal totalDiarias = reservasValidas(inicio, fim).stream()
                .map(r -> r.getQuarto().getValorDiaria().multiply(BigDecimal.valueOf(diariasNoPeriodo(r, inicio, fim))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalConsumos = consumos.totalNoPeriodo(inicio.atStartOfDay(), fim.plusDays(1).atStartOfDay().minusNanos(1));
        return Map.of(
                "inicio", inicio,
                "fim", fim,
                "totalDiarias", totalDiarias,
                "totalConsumos", totalConsumos,
                "total", totalDiarias.add(totalConsumos));
    }

    public Map<String, Object> diarias(LocalDate inicio, LocalDate fim) {
        validarPeriodo(inicio, fim);
        long total = reservasValidas(inicio, fim).stream().mapToLong(r -> diariasNoPeriodo(r, inicio, fim)).sum();
        return Map.of("inicio", inicio, "fim", fim, "total", total);
    }

    public List<Map<String, Object>> restaurante(LocalDate inicio, LocalDate fim) {
        validarPeriodo(inicio, fim);
        LocalDateTime inicioData = inicio.atStartOfDay();
        LocalDateTime fimData = fim.plusDays(1).atStartOfDay().minusNanos(1);
        return consumos.relatorioItens(inicioData, fimData).stream().map(linha -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("descricao", linha[0]);
            item.put("quantidade", linha[1]);
            item.put("total", linha[2]);
            return item;
        }).toList();
    }

    public Map<String, Object> reservas() {
        return Map.of(
                "total", reservas.count(),
                "reservadas", reservas.countByStatus(StatusReserva.RESERVADA),
                "hospedadas", reservas.countByStatus(StatusReserva.CHECKIN),
                "finalizadas", reservas.countByStatus(StatusReserva.FINALIZADA),
                "canceladas", reservas.countByStatus(StatusReserva.CANCELADA));
    }

    public Map<String, Object> ocupacao() {
        long total = quartos.count();
        long ocupados = quartos.countByStatusOcupacao(StatusOcupacao.OCUPADO);
        long disponiveis = quartos.countByStatusOcupacao(StatusOcupacao.DISPONIVEL);
        long emManutencao = quartos.countByStatusOcupacao(StatusOcupacao.MANUTENCAO);
        double taxa = total == 0 ? 0 : ocupados * 100.0 / total;
        return Map.of("total", total, "ocupados", ocupados, "disponiveis", disponiveis,
                "emManutencao", emManutencao, "taxaOcupacao", Math.round(taxa * 10.0) / 10.0);
    }

    public Map<String, Object> governanca() {
        return Map.of(
                "sujos", quartos.countByStatusLimpeza(StatusLimpeza.SUJO),
                "emLimpeza", quartos.countByStatusLimpeza(StatusLimpeza.EM_LIMPEZA),
                "limpos", quartos.countByStatusLimpeza(StatusLimpeza.LIMPO),
                "inspecionados", quartos.countByStatusLimpeza(StatusLimpeza.INSPECIONADO));
    }

    public Map<String, Object> manutencao() {
        return Map.of(
                "abertas", manutencoes.countByStatus(StatusManutencao.ABERTA),
                "emAndamento", manutencoes.countByStatus(StatusManutencao.EM_ANDAMENTO),
                "concluidas", manutencoes.countByStatus(StatusManutencao.CONCLUIDA),
                "canceladas", manutencoes.countByStatus(StatusManutencao.CANCELADA));
    }

    public List<Map<String, Object>> rankingQuartos() {
        return reservas.findAll().stream()
                .filter(r -> r.getStatus() != StatusReserva.CANCELADA)
                .collect(Collectors.groupingBy(r -> r.getQuarto().getNumero(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<Integer, Long>comparingByValue().reversed())
                .map(entry -> Map.<String, Object>of("quarto", entry.getKey(), "reservas", entry.getValue()))
                .toList();
    }

    private List<Reserva> reservasValidas(LocalDate inicio, LocalDate fim) {
        return reservas.findNoPeriodo(inicio, fim).stream()
                .filter(r -> r.getStatus() != StatusReserva.CANCELADA)
                .toList();
    }

    private long diariasNoPeriodo(Reserva reserva, LocalDate inicio, LocalDate fim) {
        LocalDate entrada = reserva.getDataCheckinPrevista().isBefore(inicio) ? inicio : reserva.getDataCheckinPrevista();
        LocalDate limiteExclusivo = fim.plusDays(1);
        LocalDate saida = reserva.getDataCheckoutPrevista().isAfter(limiteExclusivo)
                ? limiteExclusivo : reserva.getDataCheckoutPrevista();
        return Math.max(0, ChronoUnit.DAYS.between(entrada, saida));
    }

    private void validarPeriodo(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null || inicio.isAfter(fim)) {
            throw new IllegalArgumentException("Periodo de relatorio invalido");
        }
    }
}
