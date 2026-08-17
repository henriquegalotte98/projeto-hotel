package br.com.jprog.hotel.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

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

class UsuarioServiceTest {
    @Mock UsuarioRepository repository;
    UsuarioService service;

    @BeforeEach void configurar() {
        MockitoAnnotations.openMocks(this);
        service = new UsuarioService(repository);
    }

    @Test void deveListarUsuarios() {
        Usuario u = usuario("12345678901", "senha");
        when(repository.findAll()).thenReturn(List.of(u));
        assertEquals(List.of(u), service.listar());
    }

    @Test void deveBuscarUsuarioPorCpf() {
        Usuario u = usuario("12345678901", "senha");
        when(repository.findById(u.getCpf())).thenReturn(Optional.of(u));
        assertEquals(u, service.buscar(u.getCpf()));
    }

    @Test void deveFalharAoBuscarUsuarioInexistente() {
        when(repository.findById("99999999999")).thenReturn(Optional.empty());
        assertThrows(NoSuchElementException.class, () -> service.buscar("99999999999"));
    }

    @Test void deveCriarUsuarioAtivoComSenhaBCrypt() {
        Usuario u = usuario("12345678901", "senha-aberta");
        when(repository.existsById(u.getCpf())).thenReturn(false);
        when(repository.save(u)).thenReturn(u);
        Usuario resultado = service.criar(u);
        assertTrue(resultado.isAtivo());
        assertTrue(new BCryptPasswordEncoder().matches("senha-aberta", resultado.getSenha()));
    }

    @Test void deveImpedirCriacaoComCpfDuplicado() {
        Usuario u = usuario("12345678901", "senha");
        when(repository.existsById(u.getCpf())).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> service.criar(u));
        verify(repository, never()).save(u);
    }

    @Test void deveAtualizarSemAlterarCpf() {
        Usuario existente = usuario("12345678901", "hash-anterior");
        Usuario dados = usuario("10987654321", "nova-senha");
        when(repository.findById(existente.getCpf())).thenReturn(Optional.of(existente));
        when(repository.save(existente)).thenReturn(existente);
        Usuario resultado = service.atualizar(existente.getCpf(), dados);
        assertEquals("12345678901", resultado.getCpf());
        assertTrue(new BCryptPasswordEncoder().matches("nova-senha", resultado.getSenha()));
    }

    @Test void deveDesativarUsuario() {
        Usuario u = usuario("12345678901", "hash");
        when(repository.findById(u.getCpf())).thenReturn(Optional.of(u));
        when(repository.save(u)).thenReturn(u);
        assertFalse(service.desativar(u.getCpf()).isAtivo());
    }

    private Usuario usuario(String cpf, String senha) {
        Usuario u = new Usuario();
        u.setNome("Usuário Teste"); u.setCpf(cpf); u.setSenha(senha); u.setPapel("ADMIN"); u.setAtivo(true);
        return u;
    }
}
