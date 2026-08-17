package br.com.jprog.hotel.controller;

import br.com.jprog.hotel.dto.*;
import br.com.jprog.hotel.model.Usuario;
import br.com.jprog.hotel.repository.UsuarioRepository;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.*;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // Responsável por autenticar o usuário.
    private final AuthenticationManager authenticationManager;

    // Acessa os usuários no banco de dados.
    private final UsuarioRepository usuarioRepository;

    public AuthController(
            AuthenticationConfiguration config,
            UsuarioRepository usuarioRepository) throws Exception {

        // Obtém o gerenciador de autenticação do Spring Security.
        this.authenticationManager = config.getAuthenticationManager();
        this.usuarioRepository = usuarioRepository;
    }

    // Realiza o login do usuário.
    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest req,
            HttpServletRequest request) {

        // Verifica CPF e senha.
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                req.cpf(), req.senha()
            )
        );

        // Cria e configura o contexto de segurança.
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);

        // Salva a autenticação na sessão.
        HttpSession session = request.getSession(true);
        session.setAttribute(
            HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
            context
        );

        // Busca o usuário autenticado.
        Usuario u = usuarioRepository
                .findByCpf(req.cpf())
                .orElseThrow();

        // Retorna os dados básicos do usuário.
        return new LoginResponse(
            u.getNome(),
            u.getCpf(),
            u.getPapel()
        );
    }

    // Retorna os dados do usuário atualmente logado.
    @GetMapping("/me")
    public LoginResponse me(Authentication auth) {

        // Busca o usuário pelo CPF da autenticação.
        Usuario u = usuarioRepository
                .findByCpf(auth.getName())
                .orElseThrow();

        // Retorna os dados do usuário.
        return new LoginResponse(
            u.getNome(),
            u.getCpf(),
            u.getPapel()
        );
    }
}
