package br.com.jprog.hotel.config;

import br.com.jprog.hotel.model.Usuario;
import br.com.jprog.hotel.model.enums.Papel;
import br.com.jprog.hotel.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DadosIniciaisConfig {

    @Bean
    CommandLineRunner criarAdminInicial(
            UsuarioRepository repo,
            PasswordEncoder encoder) {
        return args -> {
            criarSeNaoExistir(repo, encoder, "Administrador", "00000000000",
                    "admin@hotel.local", "admin123", Papel.ADMIN);
            criarSeNaoExistir(repo, encoder, "Administrador", "12345678901",
                    "admin@hotelweb.com", "123456", Papel.ADMIN);
            criarSeNaoExistir(repo, encoder, "João Silva", "98765432100",
                    "joao@hotelweb.com", "123456", Papel.RECEPCIONISTA);
            criarSeNaoExistir(repo, encoder, "Maria Oliveira", "45678912300",
                    "maria@hotelweb.com", "123456", Papel.GOVERNANCA);
            criarSeNaoExistir(repo, encoder, "Carlos Souza", "78912345600",
                    "carlos@hotelweb.com", "123456", Papel.MANUTENCAO);
        };
    }

    private void criarSeNaoExistir(UsuarioRepository repo, PasswordEncoder encoder,
            String nome, String cpf, String email, String senha, Papel papel) {
        if (repo.findByCpf(cpf).isPresent()) return;

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setCpf(cpf);
        usuario.setEmail(email);
        usuario.setSenha(encoder.encode(senha));
        usuario.setPapel(papel.name());
        usuario.setAtivo(true);
        repo.save(usuario);
    }
}
