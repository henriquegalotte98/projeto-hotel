// Define o pacote onde o DTO fica.
package br.com.jprog.hotel.dto;

// Cria o objeto imutável devolvido após login ou consulta do usuário logado.
public record LoginResponse(

    // Identificador do usuário no banco.
    Long id,

    // Nome do usuário autenticado.
    String nome,

    // CPF do usuário autenticado.
    String cpf,

    // Perfil de acesso, por exemplo: ADMIN, RECEPCIONISTA etc.
    String papel

) {}