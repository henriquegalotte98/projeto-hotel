package br.com.jprog.hotel.model;


import java.time.LocalDateTime;
import java.util.Objects;

public class Usuario {
    
    private Long id;
    private String nome;
    private String cpf;
    private String senha;
    private String email;
    private String papel; // ADMIN, GERENTE, USUARIO, etc.
    private boolean ativo;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataUltimoAcesso;
    
    public Usuario() {
        this.ativo = true;
        this.dataCriacao = LocalDateTime.now();
        this.papel = "USUARIO"; // papel padrão
    }
    
    public Usuario(String nome, String cpf, String senha, String email) {
        this();
        this.nome = nome;
        this.cpf = cpf;
        this.senha = senha;
        this.email = email;
    }
    
    public Usuario(String nome, String cpf, String senha, String email, String papel) {
        this(nome, cpf, senha, email);
        this.papel = papel;
    }
    
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
        this.cpf = cpf == null ? null : cpf.replaceAll("[^0-9]", "");
    }
    
    public String getSenha() {
        return senha;
    }
    
    public void setSenha(String senha) {
        this.senha = senha;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
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
    
    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }
    
    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
    
    public LocalDateTime getDataUltimoAcesso() {
        return dataUltimoAcesso;
    }
    
    public void setDataUltimoAcesso(LocalDateTime dataUltimoAcesso) {
        this.dataUltimoAcesso = dataUltimoAcesso;
    }
    
    // Métodos de verificação de papel (função)
    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(papel);
    }
    
    public boolean isGerente() {
        return "GERENTE".equalsIgnoreCase(papel);
    }
    
    public boolean isUser() {
        return "USUARIO".equalsIgnoreCase(papel);
    }
    
    public boolean hasPapel(String papelVerificar) {
        return this.papel != null && this.papel.equalsIgnoreCase(papelVerificar);
    }
    
    public void updateUltimoAcesso() {
        this.dataUltimoAcesso = LocalDateTime.now();
    }
    
    public boolean isValidCpf() {
        if (cpf == null || cpf.isEmpty()) {
            return false;
        }
        String cpfLimpo = cpf.replaceAll("[^0-9]", "");
        return cpfLimpo.length() == 11;
    }
    
    public boolean isValidEmail() {
        if (email == null || email.isEmpty()) {
            return false;
        }
        return email.matches("^[A-Za-z0-9+_.-]+@(.+)$");
    }
    
    public void ativar() {
        this.ativo = true;
    }
    
    public void desativar() {
        this.ativo = false;
    }
    
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Usuario usuario = (Usuario) o;
        return Objects.equals(id, usuario.id) || 
               Objects.equals(cpf, usuario.cpf);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id, cpf);
    }
    
    @Override
    public String toString() {
        return "Usuario{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", cpf='" + cpf + '\'' +
                ", email='" + email + '\'' +
                ", papel='" + papel + '\'' +
                ", ativo=" + ativo +
                ", dataCriacao=" + dataCriacao +
                ", dataUltimoAcesso=" + dataUltimoAcesso +
                '}';
    }
}