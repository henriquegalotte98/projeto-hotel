package br.com.jprog.hotel.repository;

import model.Hospede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HospedeRepository extends JpaRepository<Hospede, Long> {
    
    Optional<Hospede> findByCpf(String cpf);
    
    Optional<Hospede> findByEmail(String email);
    
    boolean existsByCpf(String cpf);
    
    boolean existsByEmail(String email);
}