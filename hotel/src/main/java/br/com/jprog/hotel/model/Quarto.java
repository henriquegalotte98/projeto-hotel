package br.com.jprog.hotel.model;

import br.com.jprog.hotel.model.enums.StatusLimpeza;
import br.com.jprog.hotel.model.enums.StatusOcupacao;
import br.com.jprog.hotel.model.enums.TipoQuarto;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

/** Representa um quarto disponibilizado pelo hotel. */
@Entity
@Table(name = "quarto")
public class Quarto {

    /** Identificador gerado pelo banco de dados. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false, unique = true)
    private Integer numero;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoQuarto tipo;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valorDiaria;

    @Column(nullable = false)
    private boolean incluiCafeDaManha;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusOcupacao statusOcupacao = StatusOcupacao.DISPONIVEL;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusLimpeza statusLimpeza = StatusLimpeza.LIMPO;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }
    public TipoQuarto getTipo() { return tipo; }
    public void setTipo(TipoQuarto tipo) { this.tipo = tipo; }
    public BigDecimal getValorDiaria() { return valorDiaria; }
    public void setValorDiaria(BigDecimal valorDiaria) { this.valorDiaria = valorDiaria; }
    public boolean isIncluiCafeDaManha() { return incluiCafeDaManha; }
    public void setIncluiCafeDaManha(boolean incluiCafeDaManha) { this.incluiCafeDaManha = incluiCafeDaManha; }
    public StatusOcupacao getStatusOcupacao() { return statusOcupacao; }
    public void setStatusOcupacao(StatusOcupacao statusOcupacao) { this.statusOcupacao = statusOcupacao; }
    public StatusLimpeza getStatusLimpeza() { return statusLimpeza; }
    public void setStatusLimpeza(StatusLimpeza statusLimpeza) { this.statusLimpeza = statusLimpeza; }
}
    /** Número único usado para identificar fisicamente o quarto. */
    /** Categoria comercial do quarto. */
    /** Valor cobrado por uma diária, obrigatoriamente positivo. */
    /** Indica se a tarifa do quarto inclui café da manhã. */
    /** Situação atual de ocupação; novos quartos iniciam disponíveis. */
    /** Situação atual de limpeza; novos quartos iniciam limpos. */
