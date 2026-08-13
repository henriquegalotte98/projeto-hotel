package br.com.jprog.hotel.controller;

import br.com.jprog.hotel.service.DashboardService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final DashboardService service;
    public DashboardController(DashboardService service) { this.service = service; }

    @GetMapping
    public Map<String,Object> resumo(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fim) {
        if (inicio == null) inicio = LocalDate.now().withDayOfMonth(1);
        if (fim == null) fim = LocalDate.now();
        return service.resumo(inicio, fim);
    }
}
