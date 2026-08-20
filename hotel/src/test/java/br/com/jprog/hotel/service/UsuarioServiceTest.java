package br.com.jprog.hotel.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.jprog.hotel.model.Usuario;
import br.com.jprog.hotel.repository.UsuarioRepository;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Testes unitários das regras implementadas por {@link UsuarioService}.
 * O repositório é simulado para que os testes não dependam de um banco de dados.
 */
class UsuarioServiceTest {

    /** Simula a camada de persistência e permite controlar cada cenário. */
    @Mock
    private UsuarioRepository usuarioRepository;

    private UsuarioService usuarioService;

    /** Prepara um repositório simulado e um serviço novo antes de cada teste. */
    @BeforeEach
    void configurar() {
        MockitoAnnotations.openMocks(this);
        usuarioService = new UsuarioService(usuarioRepository);
    }

    /** Confirma que a listagem devolve os registros fornecidos pelo repositório. */
    @Test
    void deveListarUsuarios() {
        Usuario usuario = usuario(1L, "12345678901", "senha");
        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));

        List<Usuario> resultado = usuarioService.listar();

        assertEquals(List.of(usuario), resultado);
    }

    /** Confirma que um usuário existente pode ser localizado pelo identificador. */
    @Test
    void deveBuscarUsuarioPorId() {
        Usuario usuario = usuario(1L, "12345678901", "senha");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));

        assertEquals(usuario, usuarioService.buscar(1L));
    }

    /** Confirma que uma busca inexistente produz um erro explícito. */
    @Test
    void deveFalharAoBuscarUsuarioInexistente() {
        when(usuarioRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> usuarioService.buscar(99L));
    }

    /** Confirma que a criação ativa o usuário e troca a senha por um hash BCrypt. */
    @Test
    void deveCriarUsuarioAtivoComSenhaBCrypt() {
        Usuario usuario = usuario(null, "12345678901", "senha-aberta");
        when(usuarioRepository.existsByCpf(usuario.getCpf())).thenReturn(false);
        when(usuarioRepository.existsByEmail(usuario.getEmail())).thenReturn(false);
        when(usuarioRepository.save(usuario)).thenReturn(usuario);

        Usuario resultado = usuarioService.criar(usuario);

        assertTrue(resultado.isAtivo());
        assertNotEquals("senha-aberta", resultado.getSenha());
        assertTrue(new BCryptPasswordEncoder().matches("senha-aberta", resultado.getSenha()));
        verify(usuarioRepository).save(usuario);
    }

    /** Confirma que um CPF já cadastrado impede a criação. */
    @Test
    void deveImpedirCriacaoComCpfDuplicado() {
        Usuario usuario = usuario(null, "12345678901", "senha");
        when(usuarioRepository.existsByCpf(usuario.getCpf())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> usuarioService.criar(usuario));
        verify(usuarioRepository, never()).save(usuario);
    }

    /** Confirma a atualização dos dados e a criptografia de uma nova senha. */
    @Test
    void deveAtualizarUsuarioECriptografarNovaSenha() {
        Usuario existente = usuario(1L, "12345678901", "hash-anterior");
        Usuario atualizacao = usuario(null, "10987654321", "nova-senha");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(usuarioRepository.existsByCpfAndIdNot(atualizacao.getCpf(), 1L)).thenReturn(false);
        when(usuarioRepository.save(existente)).thenReturn(existente);

        Usuario resultado = usuarioService.atualizar(1L, atualizacao);

        assertEquals("10987654321", resultado.getCpf());
        assertTrue(new BCryptPasswordEncoder().matches("nova-senha", resultado.getSenha()));
    }

    /** Confirma que um usuário não pode assumir o CPF de outro cadastro. */
    @Test
    void deveImpedirAtualizacaoComCpfDeOutroUsuario() {
        Usuario existente = usuario(1L, "12345678901", "hash");
        Usuario atualizacao = usuario(null, "10987654321", "nova-senha");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(usuarioRepository.existsByCpfAndIdNot(atualizacao.getCpf(), 1L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> usuarioService.atualizar(1L, atualizacao));
        verify(usuarioRepository, never()).save(existente);
    }

    @Test
    void deveImpedirAtualizacaoComEmailDeOutroUsuario() {
        Usuario existente = usuario(1L, "12345678901", "hash");
        Usuario atualizacao = usuario(null, "12345678901", "");
        atualizacao.setEmail("email.existente@hotelweb.com");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(usuarioRepository.existsByEmailAndIdNot(atualizacao.getEmail(), 1L)).thenReturn(true);

        IllegalArgumentException erro = assertThrows(
                IllegalArgumentException.class,
                () -> usuarioService.atualizar(1L, atualizacao));

        assertEquals("E-mail já cadastrado para outro usuário", erro.getMessage());
        verify(usuarioRepository, never()).save(existente);
    }

    /** Confirma que a desativação preserva o registro e altera somente seu estado. */
    @Test
    void deveDesativarUsuarioSemExcluiLo() {
        Usuario usuario = usuario(1L, "12345678901", "hash");
        when(usuarioRepository.findById(1L)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.save(usuario)).thenReturn(usuario);

        Usuario resultado = usuarioService.desativar(1L);

        assertFalse(resultado.isAtivo());
        verify(usuarioRepository).save(usuario);
    }

    /** Cria dados reutilizáveis para manter os testes curtos e legíveis. */
    private Usuario usuario(Long id, String cpf, String senha) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setNome("Usuário Teste");
        usuario.setCpf(cpf);
        usuario.setEmail("usuario@hotelweb.com");
        usuario.setSenha(senha);
        usuario.setPapel("ADMIN");
        usuario.setAtivo(true);
        return usuario;
    }
}
