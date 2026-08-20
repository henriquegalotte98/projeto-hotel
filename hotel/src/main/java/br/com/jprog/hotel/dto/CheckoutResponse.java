package br.com.jprog.hotel.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Resumo financeiro devolvido ao finalizar uma hospedagem. */
public record CheckoutResponse(
        Long reservaId,
        LocalDateTime dataCheckout,
        BigDecimal totalDiarias,
        BigDecimal totalConsumos,
        BigDecimal totalGeral
) {}
