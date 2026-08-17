package br.com.jprog.hotel.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
public class RelatorioService {
    public Map<String,Object> faturamento(LocalDate inicio, LocalDate fim) { return Map.of("inicio", inicio, "fim", fim, "total", 0); }
    public Map<String,Object> diarias(LocalDate inicio, LocalDate fim) { return Map.of("inicio", inicio, "fim", fim, "total", 0); }
    public List<Map<String,Object>> restaurante(LocalDate inicio, LocalDate fim) { return List.of(); }
    public Map<String,Object> reservas() { return Map.of(); }
    public Map<String,Object> ocupacao() { return Map.of(); }
    public Map<String,Object> governanca() { return Map.of(); }
    public Map<String,Object> manutencao() { return Map.of(); }
    public List<Map<String,Object>> rankingQuartos() { return List.of(); }
}
