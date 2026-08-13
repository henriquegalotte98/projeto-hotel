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
    
    @NotBlank(message = "Tipo do quarto é obrigatório")
    @Column(nullable = false)
    private String tipo;
    
    @NotNull(message = "Valor da diária é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor da diária deve ser maior que zero")
    @Column(nullable = false)
    private BigDecimal valorDiaria;
    
    @Column(name = "inclui_cafe_da_manha")
    private boolean incluiCafeDaManha;
    
    @NotBlank(message = "Status de ocupação é obrigatório")
    @Column(name = "status_ocupacao", nullable = false)
    private String statusOcupacao;
    
    @NotBlank(message = "Status de limpeza é obrigatório")
    @Column(name = "status_limpeza", nullable = false)
    private String statusLimpeza;
    
    // Construtores
    public Quarto() {
        this.statusOcupacao = "DISPONIVEL";
        this.statusLimpeza = "LIMPO";
    }
    
    public Quarto(String numero, String tipo, BigDecimal valorDiaria, boolean incluiCafeDaManha) {
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
    
    public String getTipo() {
        return tipo;
    }
    
    public void setTipo(String tipo) {
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
    
    public String getStatusOcupacao() {
        return statusOcupacao;
    }
    
    public void setStatusOcupacao(String statusOcupacao) {
        this.statusOcupacao = statusOcupacao;
    }
    
    public String getStatusLimpeza() {
        return statusLimpeza;
    }
    
    public void setStatusLimpeza(String statusLimpeza) {
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