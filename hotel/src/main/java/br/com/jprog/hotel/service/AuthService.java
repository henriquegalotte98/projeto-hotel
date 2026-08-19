package br.com.jprog.hotel.service;

import br.com.jprog.hotel.config.UsuarioPrincipal;
import br.com.jprog.hotel.dto.LoginRequest;
import br.com.jprog.hotel.dto.LoginResponse;
import br.com.jprog.hotel.model.Usuario;
import br.com.jprog.hotel.repository.UsuarioRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/** Regras de autenticacao que independem da camada HTTP. */
@Service
public class AuthService {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarios, PasswordEncoder passwordEncoder) {
        this.usuarios = usuarios;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioPrincipal carregar(String cpf) {
        Usuario usuario = usuarios.findByCpf(cpf)
                .filter(Usuario::isAtivo)
                .orElseThrow(() -> new BadCredentialsException("CPF ou senha invalidos"));
        return new UsuarioPrincipal(usuario);
    }

    public LoginResponse autenticar(LoginRequest request) {
        Usuario usuario = carregar(request.cpf()).getUsuario();
        if (!passwordEncoder.matches(request.senha(), usuario.getSenha())) {
            throw new BadCredentialsException("CPF ou senha invalidos");
        }
        return resposta(usuario);
    }

    public LoginResponse usuarioAtual(String cpf) {
        return resposta(carregar(cpf).getUsuario());
    }

    private LoginResponse resposta(Usuario usuario) {
        return new LoginResponse(usuario.getId(), usuario.getNome(), usuario.getCpf(), usuario.getPapel());
    }
}
