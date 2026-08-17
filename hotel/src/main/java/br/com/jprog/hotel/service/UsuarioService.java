package br.com.jprog.hotel.service;

import br.com.jprog.hotel.model.Usuario;
import br.com.jprog.hotel.repository.UsuarioRepository;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {
    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UsuarioService(UsuarioRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<Usuario> listar() { return repository.findAll(); }

    @Transactional(readOnly = true)
    public Usuario buscar(String cpf) {
        return repository.findById(cpf)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + cpf));
    }

    @Transactional
    public Usuario criar(Usuario usuario) {
        if (repository.existsById(usuario.getCpf())) throw new IllegalArgumentException("CPF já cadastrado");
        usuario.setSenha(criptografarSenhaObrigatoria(usuario.getSenha()));
        usuario.setAtivo(true);
        return repository.save(usuario);
    }

    @Transactional
    public Usuario atualizar(String cpf, Usuario dados) {
        Usuario usuario = buscar(cpf);
        usuario.setNome(dados.getNome());
        usuario.setPapel(dados.getPapel());
        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dados.getSenha()));
        }
        return repository.save(usuario);
    }

    @Transactional
    public Usuario desativar(String cpf) {
        Usuario usuario = buscar(cpf);
        usuario.setAtivo(false);
        return repository.save(usuario);
    }

    private String criptografarSenhaObrigatoria(String senha) {
        if (senha == null || senha.isBlank()) throw new IllegalArgumentException("Senha é obrigatória");
        return passwordEncoder.encode(senha);
    }
}
