package br.com.jprog.hotel.service;

import br.com.jprog.hotel.model.Usuario;
import br.com.jprog.hotel.repository.UsuarioRepository;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Aplica as regras de negócio do cadastro de usuários.
 *
 * <p>O serviço coordena o acesso ao repositório, impede CPFs duplicados,
 * protege senhas com BCrypt e realiza a desativação lógica do cadastro.</p>
 */
@Service
public class UsuarioService {

    /** Repositório utilizado para consultar e persistir usuários. */
    private final UsuarioRepository usuarioRepository;

    /** Componente responsável por gerar hashes BCrypt das senhas. */
    private final PasswordEncoder passwordEncoder;

    /**
     * Cria o serviço com o repositório fornecido pelo Spring e configura o BCrypt.
     */
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    /** Retorna todos os usuários cadastrados sem alterar o banco. */
    @Transactional(readOnly = true)
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    /**
     * Busca um usuário pelo identificador.
     *
     * @throws NoSuchElementException quando o cadastro não existe
     */
    @Transactional(readOnly = true)
    public Usuario buscar(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Usuário não encontrado: " + id));
    }

    /**
     * Cria um usuário ativo depois de validar o CPF e criptografar a senha.
     * O identificador recebido é descartado para impedir uma atualização acidental.
     */
    @Transactional
    public Usuario criar(Usuario usuario) {
        validarCpfDuplicadoNaCriacao(usuario.getCpf());
        validarEmailDuplicadoNaCriacao(usuario.getEmail());
        usuario.setId(null);
        usuario.setSenha(criptografarSenhaObrigatoria(usuario.getSenha()));
        usuario.setAtivo(true);
        return usuarioRepository.save(usuario);
    }

    /**
     * Atualiza os dados de um usuário existente.
     * Uma nova senha somente substitui a atual quando foi efetivamente informada.
     */
    @Transactional
    public Usuario atualizar(Long id, Usuario dadosAtualizados) {
        Usuario usuario = buscar(id);
        validarCpfDuplicadoNaAtualizacao(dadosAtualizados.getCpf(), id);
        validarEmailDuplicadoNaAtualizacao(dadosAtualizados.getEmail(), id);

        usuario.setNome(dadosAtualizados.getNome());
        usuario.setCpf(dadosAtualizados.getCpf());
        usuario.setEmail(dadosAtualizados.getEmail());
        usuario.setPapel(dadosAtualizados.getPapel());

        if (dadosAtualizados.getSenha() != null && !dadosAtualizados.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dadosAtualizados.getSenha()));
        }

        return usuarioRepository.save(usuario);
    }

    /**
     * Desativa o usuário sem remover seu registro e seu histórico do banco.
     */
    @Transactional
    public Usuario desativar(Long id) {
        Usuario usuario = buscar(id);
        usuario.setAtivo(false);
        return usuarioRepository.save(usuario);
    }

    /** Impede a criação quando o CPF já pertence a qualquer usuário. */
    private void validarCpfDuplicadoNaCriacao(String cpf) {
        if (usuarioRepository.existsByCpf(cpf)) {
            throw new IllegalArgumentException("CPF já cadastrado");
        }
    }

    /** Impede que uma atualização utilize o CPF pertencente a outro cadastro. */
    private void validarCpfDuplicadoNaAtualizacao(String cpf, Long id) {
        if (usuarioRepository.existsByCpfAndIdNot(cpf, id)) {
            throw new IllegalArgumentException("CPF já cadastrado");
        }
    }

    private void validarEmailDuplicadoNaCriacao(String email) {
        if (usuarioRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }
    }

    private void validarEmailDuplicadoNaAtualizacao(String email, Long id) {
        if (usuarioRepository.existsByEmailAndIdNot(email, id)) {
            throw new IllegalArgumentException("E-mail já cadastrado para outro usuário");
        }
    }

    /** Valida a presença da senha e devolve somente seu hash BCrypt. */
    private String criptografarSenhaObrigatoria(String senha) {
        if (senha == null || senha.isBlank()) {
            throw new IllegalArgumentException("Senha é obrigatória");
        }
        return passwordEncoder.encode(senha);
    }
}
