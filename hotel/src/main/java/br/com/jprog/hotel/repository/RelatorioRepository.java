package br.com.jprog.hotel.repository;

import br.com.jprog.hotel.model.Relatorio;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Consulta dados agregados sem persistir relatorios como entidades. */
@Repository
public class RelatorioRepository {
    private final ReservaRepository reservas;
    private final ConsumoExtraRepository consumos;

    public RelatorioRepository(ReservaRepository reservas, ConsumoExtraRepository consumos) {
        this.reservas = reservas;
        this.consumos = consumos;
    }

    public Relatorio faturamento(LocalDate inicio, LocalDate fim) {
        BigDecimal totalConsumos = consumos.totalNoPeriodo(inicio.atStartOfDay(), fim.plusDays(1).atStartOfDay().minusNanos(1));
        Map<String, Object> dados = new LinkedHashMap<>();
        dados.put("totalConsumos", totalConsumos);
        dados.put("quantidadeReservas", reservas.findNoPeriodo(inicio, fim).size());
        return new Relatorio("FATURAMENTO", inicio, fim, dados);
    }

    public List<Map<String, Object>> itensConsumidos(LocalDate inicio, LocalDate fim) {
        return consumos.relatorioItens(inicio.atStartOfDay(), fim.plusDays(1).atStartOfDay().minusNanos(1))
                .stream().map(linha -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("descricao", linha[0]);
                    item.put("quantidade", linha[1]);
                    item.put("total", linha[2]);
                    return item;
                }).toList();
    }
}
