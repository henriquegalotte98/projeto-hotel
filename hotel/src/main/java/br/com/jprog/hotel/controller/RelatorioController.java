package br.com.jprog.hotel.controller;
import br.com.jprog.hotel.service.RelatorioService;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {
    private final RelatorioService service;
    public RelatorioController(RelatorioService service) { this.service = service; }

    @GetMapping("/faturamento") public Map<String,Object> faturamento(@RequestParam LocalDate inicio, @RequestParam LocalDate fim) { return service.faturamento(inicio, fim); }
    @GetMapping("/diarias") public Map<String,Object> diarias(@RequestParam LocalDate inicio, @RequestParam LocalDate fim) { return service.diarias(inicio, fim); }
    @GetMapping("/restaurante") public List<Map<String,Object>> restaurante(@RequestParam LocalDate inicio, @RequestParam LocalDate fim) { return service.restaurante(inicio, fim); }
    @GetMapping("/reservas") public Map<String,Object> reservas() { return service.reservas(); }
    @GetMapping("/ocupacao") public Map<String,Object> ocupacao() { return service.ocupacao(); }
    @GetMapping("/governanca") public Map<String,Object> governanca() { return service.governanca(); }
    @GetMapping("/manutencao") public Map<String,Object> manutencao() { return service.manutencao(); }
    @GetMapping("/ranking-quartos") public List<Map<String,Object>> ranking() { return service.rankingQuartos(); }
}
