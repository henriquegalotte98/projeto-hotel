// Define o pacote onde o DTO fica.
package br.com.jprog.hotel.dto;

// Importa a validação que impede campo nulo, vazio ou apenas com espaços.
import jakarta.validation.constraints.NotBlank;

// Cria um record: classe curta, imutável, com construtor e métodos
// cpf() e senha() gerados automaticamente.
public record LoginRequest(

    // CPF recebido no corpo da requisição; deve ser preenchido.
    @NotBlank String cpf,

    // Senha recebida no corpo da requisição; deve ser preenchida.
    @NotBlank String senha

) {}