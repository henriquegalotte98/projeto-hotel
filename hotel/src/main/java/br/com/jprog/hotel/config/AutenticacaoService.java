package br.com.jprog.hotel.config;

import br.com.jprog.hotel.model.Usuario;
import br.com.jprog.hotel.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class AutenticacaoService implements UserDetailsService {

    // Repositório para buscar o usuário no banco.
    private final UsuarioRepository repository;

    public AutenticacaoService(UsuarioRepository repository) {
        this.repository = repository;
    }

    // Carrega o usuário pelo CPF durante a autenticação.
    @Override
    public UserDetails loadUserByUsername(String cpf)
            throws UsernameNotFoundException {

        // Busca o usuário pelo CPF.
        Usuario u = repository.findByCpf(cpf)
            .orElseThrow(() ->
                new UsernameNotFoundException("CPF não encontrado"));

        // Impede o login de usuários inativos.
        if (!u.isAtivo())
            throw new UsernameNotFoundException("Usuário inativo");

        return new UsuarioPrincipal(u);
    }
}
