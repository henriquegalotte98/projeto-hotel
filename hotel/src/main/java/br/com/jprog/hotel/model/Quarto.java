package br.com.jprog.hotel.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "quartos")
public class Quarto implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Número do quarto é obrigatório")
    @Column(unique = true, nullable = false)
    private String numero;
    
    @NotNull(message = "Tipo do quarto é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoQuarto tipo;
    
    @NotNull(message = "Valor da diária é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor da diária deve ser maior que zero")
    @Column(nullable = false)
    private BigDecimal valorDiaria;
    
    @Column(name = "inclui_cafe_da_manha")
    private boolean incluiCafeDaManha;
    
    @NotNull(message = "Status de ocupação é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "status_ocupacao", nullable = false)
    private StatusOcupacao statusOcupacao;
    
    @NotNull(message = "Status de limpeza é obrigatório")
    @Enumerated(EnumType.STRING)
    @Column(name = "status_limpeza", nullable = false)
    private StatusLimpeza statusLimpeza;
    
    // Construtores
    public Quarto() {
        this.statusOcupacao = StatusOcupacao.DISPONIVEL;
        this.statusLimpeza = StatusLimpeza.LIMPO;
    }
    
    public Quarto(String numero, TipoQuarto tipo, BigDecimal valorDiaria, boolean incluiCafeDaManha) {
        this();
        this.numero = numero;
        this.tipo = tipo;
        this.valorDiaria = valorDiaria;
        this.incluiCafeDaManha = incluiCafeDaManha;
    }
    
    // Getters e Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNumero() {
        return numero;
    }
    
    public void setNumero(String numero) {
        this.numero = numero;
    }
    
    public TipoQuarto getTipo() {
        return tipo;
    }
    
    public void setTipo(TipoQuarto tipo) {
        this.tipo = tipo;
    }
    
    public BigDecimal getValorDiaria() {
        return valorDiaria;
    }
    
    public void setValorDiaria(BigDecimal valorDiaria) {
        this.valorDiaria = valorDiaria;
    }
    
    public boolean isIncluiCafeDaManha() {
        return incluiCafeDaManha;
    }
    
    public void setIncluiCafeDaManha(boolean incluiCafeDaManha) {
        this.incluiCafeDaManha = incluiCafeDaManha;
    }
    
    public StatusOcupacao getStatusOcupacao() {
        return statusOcupacao;
    }
    
    public void setStatusOcupacao(StatusOcupacao statusOcupacao) {
        this.statusOcupacao = statusOcupacao;
    }
    
    public StatusLimpeza getStatusLimpeza() {
        return statusLimpeza;
    }
    
    public void setStatusLimpeza(StatusLimpeza statusLimpeza) {
        this.statusLimpeza = statusLimpeza;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Quarto quarto = (Quarto) o;
        return Objects.equals(id, quarto.id) || 
               Objects.equals(numero, quarto.numero);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, numero);
    }
}