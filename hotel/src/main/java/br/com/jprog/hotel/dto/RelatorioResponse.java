package br.com.jprog.hotel.dto;

import java.time.LocalDate;
import java.util.Map;

/** Formato uniforme para os relatorios retornados pela API. */
public record RelatorioResponse(
        String tipo,
        LocalDate inicio,
        LocalDate fim,
        Map<String, Object> dados
) {
    public RelatorioResponse {
        dados = dados == null ? Map.of() : Map.copyOf(dados);
    }
}
