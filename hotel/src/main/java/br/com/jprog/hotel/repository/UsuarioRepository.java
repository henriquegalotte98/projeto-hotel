package br.com.jprog.hotel.repository;

import br.com.jprog.hotel.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Optional<Usuario> findByCpf(String cpf);
    boolean existsByCpf(String cpf);
}
