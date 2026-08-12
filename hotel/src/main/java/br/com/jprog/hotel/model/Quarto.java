package br.com.jprog.hotel.model;

public class Quarto {

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
    
    private static final long serialVersionUID = 1L;
    
    // Identificação
    private Long id;
    private String numero;
    private String andar;
    private TipoQuarto tipo;
    private StatusQuarto status;
    private StatusLimpeza statusLimpeza;
    
    // Características
    private int capacidade;
    private int quantidadeCamas;
    private String descricao;
    private String comodidades; // Lista de comodidades separadas por vírgula
    
    // Tarifas
    private BigDecimal tarifaDiaria;
    private BigDecimal tarifaSemanal;
    private BigDecimal tarifaMensal;
    private BigDecimal tarifaPromocional;
    
    // Disponibilidade
    private boolean disponivel;
    private LocalDateTime dataUltimaReserva;
    private LocalDateTime dataProximaDisponibilidade;
    
    // Controle de limpeza
    private LocalDateTime dataUltimaLimpeza;
    private LocalDateTime dataProximaLimpeza;
    private String responsavelLimpeza;
    private String observacoesLimpeza;
    private boolean precisaLimpeza;
    private PrioridadeLimpeza prioridadeLimpeza;
    
    // Controle interno
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private boolean ativo;
    
    // Construtores
    public Quarto() {
        this.status = StatusQuarto.DISPONIVEL;
        this.statusLimpeza = StatusLimpeza.LIMPO;
        this.disponivel = true;
        this.ativo = true;
        this.dataCriacao = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
        this.precisaLimpeza = false;
        this.prioridadeLimpeza = PrioridadeLimpeza.NORMAL;
    }
    
    public Quarto(String numero, TipoQuarto tipo, int capacidade) {
        this();
        this.numero = numero;
        this.tipo = tipo;
        this.capacidade = capacidade;
    }
    
    public Quarto(String numero, String andar, TipoQuarto tipo, int capacidade, BigDecimal tarifaDiaria) {
        this(numero, tipo, capacidade);
        this.andar = andar;
        this.tarifaDiaria = tarifaDiaria;
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
    
    public String getAndar() {
        return andar;
    }
    
    public void setAndar(String andar) {
        this.andar = andar;
    }
    
    public TipoQuarto getTipo() {
        return tipo;
    }
    
    public void setTipo(TipoQuarto tipo) {
        this.tipo = tipo;
    }
    
    public StatusQuarto getStatus() {
        return status;
    }
    
    public void setStatus(StatusQuarto status) {
        this.status = status;
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public StatusLimpeza getStatusLimpeza() {
        return statusLimpeza;
    }
    
    public void setStatusLimpeza(StatusLimpeza statusLimpeza) {
        this.statusLimpeza = statusLimpeza;
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public int getCapacidade() {
        return capacidade;
    }
    
    public void setCapacidade(int capacidade) {
        this.capacidade = capacidade;
    }
    
    public int getQuantidadeCamas() {
        return quantidadeCamas;
    }
    
    public void setQuantidadeCamas(int quantidadeCamas) {
        this.quantidadeCamas = quantidadeCamas;
    }
    
    public String getDescricao() {
        return descricao;
    }
    
    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }
    
    public String getComodidades() {
        return comodidades;
    }
    
    public void setComodidades(String comodidades) {
        this.comodidades = comodidades;
    }
    
    public BigDecimal getTarifaDiaria() {
        return tarifaDiaria;
    }
    
    public void setTarifaDiaria(BigDecimal tarifaDiaria) {
        this.tarifaDiaria = tarifaDiaria;
    }
    
    public BigDecimal getTarifaSemanal() {
        return tarifaSemanal;
    }
    
    public void setTarifaSemanal(BigDecimal tarifaSemanal) {
        this.tarifaSemanal = tarifaSemanal;
    }
    
    public BigDecimal getTarifaMensal() {
        return tarifaMensal;
    }
    
    public void setTarifaMensal(BigDecimal tarifaMensal) {
        this.tarifaMensal = tarifaMensal;
    }
    
    public BigDecimal getTarifaPromocional() {
        return tarifaPromocional;
    }
    
    public void setTarifaPromocional(BigDecimal tarifaPromocional) {
        this.tarifaPromocional = tarifaPromocional;
    }
    
    public boolean isDisponivel() {
        return disponivel;
    }
    
    public void setDisponivel(boolean disponivel) {
        this.disponivel = disponivel;
        if (!disponivel) {
            this.dataUltimaReserva = LocalDateTime.now();
        }
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public LocalDateTime getDataUltimaReserva() {
        return dataUltimaReserva;
    }
    
    public void setDataUltimaReserva(LocalDateTime dataUltimaReserva) {
        this.dataUltimaReserva = dataUltimaReserva;
    }
    
    public LocalDateTime getDataProximaDisponibilidade() {
        return dataProximaDisponibilidade;
    }
    
    public void setDataProximaDisponibilidade(LocalDateTime dataProximaDisponibilidade) {
        this.dataProximaDisponibilidade = dataProximaDisponibilidade;
    }
    
    public LocalDateTime getDataUltimaLimpeza() {
        return dataUltimaLimpeza;
    }
    
    public void setDataUltimaLimpeza(LocalDateTime dataUltimaLimpeza) {
        this.dataUltimaLimpeza = dataUltimaLimpeza;
    }
    
    public LocalDateTime getDataProximaLimpeza() {
        return dataProximaLimpeza;
    }
    
    public void setDataProximaLimpeza(LocalDateTime dataProximaLimpeza) {
        this.dataProximaLimpeza = dataProximaLimpeza;
    }
    
    public String getResponsavelLimpeza() {
        return responsavelLimpeza;
    }
    
    public void setResponsavelLimpeza(String responsavelLimpeza) {
        this.responsavelLimpeza = responsavelLimpeza;
    }
    
    public String getObservacoesLimpeza() {
        return observacoesLimpeza;
    }
    
    public void setObservacoesLimpeza(String observacoesLimpeza) {
        this.observacoesLimpeza = observacoesLimpeza;
    }
    
    public boolean isPrecisaLimpeza() {
        return precisaLimpeza;
    }
    
    public void setPrecisaLimpeza(boolean precisaLimpeza) {
        this.precisaLimpeza = precisaLimpeza;
        if (precisaLimpeza) {
            this.statusLimpeza = StatusLimpeza.SUJO;
        }
    }
    
    public PrioridadeLimpeza getPrioridadeLimpeza() {
        return prioridadeLimpeza;
    }
    
    public void setPrioridadeLimpeza(PrioridadeLimpeza prioridadeLimpeza) {
        this.prioridadeLimpeza = prioridadeLimpeza;
    }
    
    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
    
    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
    
    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }
    
    public void setDataAtualizacao(LocalDateTime dataAtualizacao) {
        this.dataAtualizacao = dataAtualizacao;
    }
    
    public boolean isAtivo() {
        return ativo;
    }
    
    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }
    
    // Métodos de gerenciamento de limpeza
    public void registrarLimpeza(String responsavel) {
        this.dataUltimaLimpeza = LocalDateTime.now();
        this.responsavelLimpeza = responsavel;
        this.statusLimpeza = StatusLimpeza.LIMPO;
        this.precisaLimpeza = false;
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public void solicitarLimpeza(PrioridadeLimpeza prioridade) {
        this.precisaLimpeza = true;
        this.prioridadeLimpeza = prioridade;
        this.statusLimpeza = StatusLimpeza.SUJO;
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public void agendarProximaLimpeza(LocalDateTime data) {
        this.dataProximaLimpeza = data;
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    // Métodos de gerenciamento de disponibilidade
    public void reservar() {
        this.disponivel = false;
        this.status = StatusQuarto.OCUPADO;
        this.dataUltimaReserva = LocalDateTime.now();
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public void liberar() {
        this.disponivel = true;
        this.status = StatusQuarto.DISPONIVEL;
        this.precisaLimpeza = true;
        this.statusLimpeza = StatusLimpeza.SUJO;
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public void manutencao() {
        this.disponivel = false;
        this.status = StatusQuarto.MANUTENCAO;
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    // Métodos de tarifas
    public BigDecimal getTarifaPorPeriodo(TipoPeriodo periodo) {
        switch (periodo) {
            case DIARIO:
                return tarifaDiaria;
            case SEMANAL:
                return tarifaSemanal != null ? tarifaSemanal : tarifaDiaria.multiply(new BigDecimal("7"));
            case MENSAL:
                return tarifaMensal != null ? tarifaMensal : tarifaDiaria.multiply(new BigDecimal("30"));
            case PROMOCIONAL:
                return tarifaPromocional != null ? tarifaPromocional : tarifaDiaria;
            default:
                return tarifaDiaria;
        }
    }
    
    public boolean temPromocao() {
        return tarifaPromocional != null && tarifaPromocional.compareTo(tarifaDiaria) < 0;
    }
    
    // Métodos de validação
    public boolean isCheckinPermitido() {
        return disponivel && status == StatusQuarto.DISPONIVEL && 
               statusLimpeza == StatusLimpeza.LIMPO && ativo;
    }
    
    public boolean isCheckoutPermitido() {
        return status == StatusQuarto.OCUPADO && ativo;
    }
    
    public boolean precisaLimpezaUrgente() {
        return precisaLimpeza && prioridadeLimpeza == PrioridadeLimpeza.URGENTE;
    }
    
    // Métodos auxiliares
    public void addComodidade(String comodidade) {
        if (this.comodidades == null || this.comodidades.isEmpty()) {
            this.comodidades = comodidade;
        } else {
            this.comodidades += ", " + comodidade;
        }
        this.dataAtualizacao = LocalDateTime.now();
    }
    
    public boolean hasComodidade(String comodidade) {
        if (comodidades == null || comodidades.isEmpty()) {
            return false;
        }
        String[] lista = comodidades.split(",");
        for (String item : lista) {
            if (item.trim().equalsIgnoreCase(comodidade)) {
                return true;
            }
        }
        return false;
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
    
    @Override
    public String toString() {
        return "Quarto{" +
                "id=" + id +
                ", numero='" + numero + '\'' +
                ", andar='" + andar + '\'' +
                ", tipo=" + tipo +
                ", status=" + status +
                ", statusLimpeza=" + statusLimpeza +
                ", capacidade=" + capacidade +
                ", tarifaDiaria=" + tarifaDiaria +
                ", disponivel=" + disponivel +
                ", precisaLimpeza=" + precisaLimpeza +
                '}';
    }

}
