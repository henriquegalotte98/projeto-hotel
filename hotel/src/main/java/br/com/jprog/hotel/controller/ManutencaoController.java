package br.com.jprog.hotel.controller;

import br.com.jprog.hotel.dto.ManutencaoRequest;
import br.com.jprog.hotel.model.SolicitacaoManutencao;
import br.com.jprog.hotel.model.enums.StatusManutencao;
import br.com.jprog.hotel.service.ManutencaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manutencao")
public class ManutencaoController {
    private final ManutencaoService service;

    public ManutencaoController(ManutencaoService service) { this.service = service; }

    @GetMapping
    public List<SolicitacaoManutencao> listar(@RequestParam(required = false) Long quartoId) {
        return quartoId == null ? service.listar() : service.historicoQuarto(quartoId);
    }

    @GetMapping("/{id}")
    public SolicitacaoManutencao buscar(@PathVariable Long id) { return service.buscar(id); }

    @PostMapping
    public ResponseEntity<SolicitacaoManutencao> abrir(@Valid @RequestBody ManutencaoRequest request) {
        SolicitacaoManutencao solicitacao = new SolicitacaoManutencao();
        solicitacao.setQuartoId(request.quartoId());
        solicitacao.setDescricao(request.descricao().trim());
        return ResponseEntity.status(HttpStatus.CREATED).body(service.abrir(solicitacao));
    }

    @PatchMapping("/{id}/status")
    public SolicitacaoManutencao atualizarStatus(@PathVariable Long id,
            @RequestParam StatusManutencao status) {
        return service.atualizarStatus(id, status);
    }

    @PatchMapping("/{id}/concluir")
    public SolicitacaoManutencao concluir(@PathVariable Long id) { return service.concluir(id); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id) {
        service.excluir(id);
        return ResponseEntity.noContent().build();
    }
}
