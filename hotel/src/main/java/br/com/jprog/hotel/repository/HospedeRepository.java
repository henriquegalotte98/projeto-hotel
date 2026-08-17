package br.com.jprog.hotel.repository;

import br.com.jprog.hotel.model.Hospede;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HospedeRepository extends JpaRepository<Hospede, String> {
    Optional<Hospede> findByCpf(String cpf);
    boolean existsByCpf(String cpf);
}
