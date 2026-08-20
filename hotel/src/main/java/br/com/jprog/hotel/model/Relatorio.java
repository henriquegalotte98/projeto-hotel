package br.com.jprog.hotel.model;

import java.time.LocalDate;
import java.util.Map;

/** Resultado de relatorio calculado; nao representa uma tabela do banco. */
public final class Relatorio {
    private final String tipo;
    private final LocalDate inicio;
    private final LocalDate fim;
    private final Map<String, Object> dados;

    public Relatorio(String tipo, LocalDate inicio, LocalDate fim, Map<String, Object> dados) {
        this.tipo = tipo;
        this.inicio = inicio;
        this.fim = fim;
        this.dados = dados == null ? Map.of() : Map.copyOf(dados);
    }

    public String getTipo() { return tipo; }
    public LocalDate getInicio() { return inicio; }
    public LocalDate getFim() { return fim; }
    public Map<String, Object> getDados() { return dados; }
}
