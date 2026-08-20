package br.com.jprog.hotel.dto;

import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/** Dados opcionais informados ao confirmar o check-in. */
public record CheckinRequest(
        LocalDateTime dataCheckin,
        @Size(max = 500) String observacoes
) {}
