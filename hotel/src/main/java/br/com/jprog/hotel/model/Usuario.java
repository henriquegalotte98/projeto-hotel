package br.com.jprog.hotel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "usuario")
public class Usuario {
    @Id
    @NotBlank(message = "CPF é obrigatório")
    @Pattern(regexp = "\\d{11}", message = "CPF deve conter 11 números")
    @Column(nullable = false, length = 11)
    private String cpf;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false, length = 120)
    private String nome;

    @Column(name = "senha_hash", nullable = false)
    private String senha;

    @NotBlank(message = "Papel é obrigatório")
    @Column(nullable = false, length = 30)
    private String papel;

    @Column(nullable = false)
    private boolean ativo = true;

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public String getPapel() { return papel; }
    public void setPapel(String papel) { this.papel = papel; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
