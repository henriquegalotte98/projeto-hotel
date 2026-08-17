package br.com.jprog.hotel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Table(name = "hospedes")
public class Hospede implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 números")
    @Column(nullable = false, length = 11)
    private String cpf;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false)
    private String nome;

    @NotBlank(message = "Telefone é obrigatório")
    @Column(nullable = false)
    private String telefone;

    @Column(name = "data_cadastro")
    private LocalDateTime dataCadastro;

    @Column(name = "ativo")
    private boolean ativo;

    public Hospede() { this.ativo = true; this.dataCadastro = LocalDateTime.now(); }
    public Hospede(String nome, String cpf, String telefone) {
        this(); this.nome = nome; this.cpf = cpf; this.telefone = telefone;
    }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }

    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Hospede hospede)) return false;
        return Objects.equals(cpf, hospede.cpf);
    }
    @Override public int hashCode() { return Objects.hash(cpf); }
}
