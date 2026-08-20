package br.com.jprog.hotel.controller;

import br.com.jprog.hotel.dto.ConsumoRequest;
import br.com.jprog.hotel.model.ConsumoExtra;
import br.com.jprog.hotel.service.ConsumoExtraService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/consumos")
public class ConsumoExtraController {
    private final ConsumoExtraService service;

    public ConsumoExtraController(ConsumoExtraService service) {
        this.service = service;
    }

    @GetMapping
    public List<ConsumoExtra> listar(@RequestParam Long reservaId) {
        return service.listarPorReserva(reservaId);
    }

    @GetMapping("/total")
    public BigDecimal total(@RequestParam Long reservaId) {
        return service.totalDaReserva(reservaId);
    }

    @PostMapping
    public ResponseEntity<ConsumoExtra> lancar(@Valid @RequestBody ConsumoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.lancar(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }

}
