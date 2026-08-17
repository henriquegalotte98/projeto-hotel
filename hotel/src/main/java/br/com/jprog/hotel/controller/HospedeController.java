package br.com.jprog.hotel.controller;

import br.com.jprog.hotel.model.Hospede;
import br.com.jprog.hotel.service.HospedeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Disponibiliza as operações HTTP do cadastro de hóspedes. */
@RestController
@RequestMapping("/api/hospedes")
public class HospedeController {

    private final HospedeService service;

    public HospedeController(HospedeService service) {
        this.service = service;
    }

    /** Retorna todos os hóspedes com HTTP 200. */
    @GetMapping
    public ResponseEntity<List<Hospede>> listar() {
        return ResponseEntity.ok(service.listar());
    }

    /** Retorna o hóspede solicitado com HTTP 200. */
    @GetMapping("/{id}")
    public ResponseEntity<Hospede> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscar(id));
    }

    /** Cadastra um hóspede e retorna HTTP 201. */
    @PostMapping
    public ResponseEntity<Hospede> criar(@Valid @RequestBody Hospede hospede) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(hospede));
    }

    /** Atualiza um hóspede existente e retorna HTTP 200. */
    @PutMapping("/{id}")
    public ResponseEntity<Hospede> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody Hospede hospede) {
        return ResponseEntity.ok(service.atualizar(id, hospede));
    }

    /** Exclui um hóspede e retorna HTTP 204 sem corpo. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
