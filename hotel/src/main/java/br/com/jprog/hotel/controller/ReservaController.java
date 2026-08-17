package br.com.jprog.hotel.controller;
import br.com.jprog.hotel.dto.ReservaRequest;
import br.com.jprog.hotel.model.Reserva;
import br.com.jprog.hotel.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {
    private final ReservaService service;
    public ReservaController(ReservaService service) { this.service = service; }

    @GetMapping
    public List<Reserva> listar(@RequestParam(required=false) String hospedeCpf,
                                @RequestParam(required=false) Long quartoId,
                                @RequestParam(required=false) LocalDate inicio,
                                @RequestParam(required=false) LocalDate fim) {
        if (hospedeCpf != null) return service.porHospede(hospedeCpf);
        if (quartoId != null) return service.porQuarto(quartoId);
        if (inicio != null && fim != null) return service.porPeriodo(inicio, fim);
        return service.listar();
    }

    @GetMapping("/{id}") public Reserva buscar(@PathVariable Long id) { return service.buscar(id); }
    @PostMapping public ResponseEntity<Reserva> criar(@Valid @RequestBody ReservaRequest req) { return ResponseEntity.status(201).body(service.criar(req)); }
    @PatchMapping("/{id}/cancelar") public Reserva cancelar(@PathVariable Long id) { return service.cancelar(id); }
    @PostMapping("/{id}/checkin") public Reserva checkin(@PathVariable Long id) { return service.checkin(id); }
    @PostMapping("/{id}/checkout") public Reserva checkout(@PathVariable Long id) { return service.checkout(id); }
}
