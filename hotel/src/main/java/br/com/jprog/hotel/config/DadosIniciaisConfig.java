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
            if (repo.findByCpf("00000000000").isEmpty()) {
                Usuario admin = new Usuario();
                admin.setNome("Administrador");
                admin.setCpf("00000000000");
                admin.setEmail("admin@hotel.local");
                admin.setSenha(encoder.encode("admin123"));
                admin.setPapel(Papel.ADMIN.name());
                admin.setAtivo(true);
                repo.save(admin);
            }
        };
    }
}
