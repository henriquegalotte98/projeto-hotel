package br.com.jprog.hotel.repository;

import br.com.jprog.hotel.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Centraliza as operações de persistência de usuários.
 *
 * <p>As operações básicas, como listar, buscar e salvar, são herdadas de
 * {@link JpaRepository}. Os métodos adicionais verificam a unicidade do CPF.</p>
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /** Verifica se qualquer usuário já utiliza o CPF informado. */
    boolean existsByCpf(String cpf);

    /**
     * Verifica se outro usuário utiliza o CPF informado, ignorando o cadastro
     * que está sendo atualizado.
     */
    boolean existsByCpfAndIdNot(String cpf, Long id);
}
