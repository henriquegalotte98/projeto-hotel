package br.com.jprog.hotel.model;

import br.com.jprog.hotel.model.enums.StatusManutencao;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/** Registra um chamado de manutenção associado a um quarto. */
@Entity
@Table(name = "solicitacao_manutencao")
public class SolicitacaoManutencao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "O quarto é obrigatório")
    @Column(name = "quarto_id", nullable = false)
    private Long quartoId;

    @NotBlank(message = "A descrição é obrigatória")
    @Size(max = 500, message = "A descrição deve ter no máximo 500 caracteres")
    @Column(nullable = false, length = 500)
    private String descricao;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusManutencao status = StatusManutencao.ABERTA;

    @Column(name = "aberta_em", nullable = false)
    private LocalDateTime abertaEm;

    @Column(name = "concluida_em")
    private LocalDateTime concluidaEm;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getQuartoId() { return quartoId; }
    public void setQuartoId(Long quartoId) { this.quartoId = quartoId; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public StatusManutencao getStatus() { return status; }
    public void setStatus(StatusManutencao status) { this.status = status; }
    public LocalDateTime getAbertaEm() { return abertaEm; }
    public void setAbertaEm(LocalDateTime abertaEm) { this.abertaEm = abertaEm; }
    public LocalDateTime getConcluidaEm() { return concluidaEm; }
    public void setConcluidaEm(LocalDateTime concluidaEm) { this.concluidaEm = concluidaEm; }
}
