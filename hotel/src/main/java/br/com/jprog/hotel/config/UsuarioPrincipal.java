package br.com.jprog.hotel.config;

import br.com.jprog.hotel.model.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;

/** Adapta o usuario da aplicacao ao contrato do Spring Security. */
public final class UsuarioPrincipal implements UserDetails {
    private final Usuario usuario;

    public UsuarioPrincipal(Usuario usuario) {
        this.usuario = Objects.requireNonNull(usuario, "usuario");
    }

    public Usuario getUsuario() { return usuario; }
    public Long getId() { return usuario.getId(); }
    public String getNome() { return usuario.getNome(); }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String papel = usuario.getPapel();
        String autoridade = papel.startsWith("ROLE_") ? papel : "ROLE_" + papel;
        return List.of(new SimpleGrantedAuthority(autoridade));
    }

    @Override public String getPassword() { return usuario.getSenha(); }
    @Override public String getUsername() { return usuario.getCpf(); }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return usuario.isAtivo(); }
}
