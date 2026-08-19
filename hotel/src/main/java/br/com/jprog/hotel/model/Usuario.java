package br.com.jprog.hotel.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Representa um usuário que pode acessar o HOTELWEB.
 *
 * <p>A classe faz o mapeamento entre objetos Java e a tabela {@code usuario}.
 * A senha armazenada no campo {@code senha} deve conter somente o hash BCrypt.</p>
 */
@Entity
@Table(name = "usuario")
public class Usuario {

    /** Identificador gerado automaticamente pelo banco de dados. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Nome completo usado para identificar o usuário. */
    @Column(nullable = false, length = 120)
    private String nome;

    /** CPF sem pontuação; deve ser único entre os usuários. */
    @Column(nullable = false, unique = true, length = 11)
    private String cpf;

    /** Endereço de e-mail único utilizado pelo usuário. */
    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** Hash BCrypt da senha; o valor original não deve ser persistido. */
    @Column(name = "senha_hash", nullable = false)
    private String senha;

    /** Papel que identifica as responsabilidades do usuário no sistema. */
    @Column(nullable = false, length = 30)
    private String papel;

    /** Indica se o usuário está autorizado a permanecer ativo no cadastro. */
    @Column(nullable = false)
    private boolean ativo = true;

    // Os métodos abaixo permitem que o JPA e as demais camadas leiam e alterem os campos.
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCpf() {
        return cpf;
    }

    public void setCpf(String cpf) {
        this.cpf = cpf;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getPapel() {
        return papel;
    }

    public void setPapel(String papel) {
        this.papel = papel;
    }

    public boolean isAtivo() {
        return ativo;
    }

    public void setAtivo(boolean ativo) {
        this.ativo = ativo;
    }
}
