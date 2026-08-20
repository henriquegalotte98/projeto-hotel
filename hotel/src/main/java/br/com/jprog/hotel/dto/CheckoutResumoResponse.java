package br.com.jprog.hotel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Valores que devem ser conferidos antes da confirmação do check-out. */
public record CheckoutResumoResponse(
        Long reservaId,
        long quantidadeDiarias,
        BigDecimal valorDiaria,
        BigDecimal totalDiarias,
        List<ConsumoItem> consumos,
        BigDecimal totalConsumos,
        BigDecimal totalGeral
) {
    public record ConsumoItem(Long id, String descricao, BigDecimal valor, LocalDateTime dataLancamento) {}
}
