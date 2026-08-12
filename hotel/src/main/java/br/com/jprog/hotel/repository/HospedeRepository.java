package br.com.jprog.hotel.repository;

import br.com.jprog.hotel.model.Hospede;
import org.springframework.data.jpa.repository.JpaRepository;

/** Contrato de persistência dos hóspedes. */
public interface HospedeRepository extends JpaRepository<Hospede, Long> {
    boolean existsByCpf(String cpf);
    boolean existsByEmailIgnoreCase(String email);
}
