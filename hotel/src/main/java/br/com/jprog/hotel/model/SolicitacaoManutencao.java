package br.com.jprog.hotel.model;

public class SolicitacaoManutencao {

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "solicitacoes_manutencao")
public class SolicitacaoManutencao implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "quarto_id", nullable = false)
    private Quarto quarto;
    
    @Column(nullable = false)
    private String descricao;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatusManutencao status;
    
    @Column(name = "data_abertura", nullable = false)
    private LocalDateTime dataAbertura;
    
    @Column(name = "data_conclusao")
    private LocalDateTime dataConclusao;
    
    public SolicitacaoManutencao() {
        this.status = StatusManutencao.ABERTA;
        this.dataAbertura = LocalDateTime.now();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Quarto getQuarto() {
        return quarto;
    }
    
    public void setQuarto(Quarto quarto) {
        this.quarto = quarto;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
    
    public StatusManutencao getStatus() {
        return status;
    }
    
    public void setStatus(StatusManutencao status) {
        this.status = status;
    }
    
    public LocalDateTime getDataAbertura() {
        return dataAbertura;
    }
    
    public void setDataAbertura(LocalDateTime dataAbertura) {
        this.dataAbertura = dataAbertura;
    }
    
    public LocalDateTime getDataConclusao() {
        return dataConclusao;
    }
    
    public void setDataConclusao(LocalDateTime dataConclusao) {
        this.dataConclusao = dataConclusao;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        SolicitacaoManutencao that = (SolicitacaoManutencao) o;
        return Objects.equals(id, that.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
}
