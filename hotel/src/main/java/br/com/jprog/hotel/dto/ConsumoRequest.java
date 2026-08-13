// Diz em qual “gaveta” do projeto este arquivo está.
// Neste caso, fica na pasta dto.
package br.com.jprog.hotel.dto;

// Pega a regra que diz que um número decimal precisa ser,
// no mínimo, 0.01.
import jakarta.validation.constraints.DecimalMin;

// Pega a regra que diz que um texto não pode ser vazio.
import jakarta.validation.constraints.NotBlank;

// Pega a regra que diz que um valor não pode faltar.
import jakarta.validation.constraints.NotNull;

// Pega o tipo BigDecimal.
// Ele é usado para guardar dinheiro com segurança,
// por exemplo: 12.50 ou 89.90.
import java.math.BigDecimal;

// Cria uma caixinha chamada ConsumoRequest.
//
// Ela serve para receber os dados enviados para registrar
// um consumo extra de uma reserva.
public record ConsumoRequest(

    // Guarda o ID da reserva que fez o consumo.
    //
    // @NotNull impede criar o consumo sem informar
    // a qual reserva ele pertence.
    @NotNull Long reservaId,

    // Guarda a explicação do consumo.
    //
    // @NotBlank impede que a explicação fique vazia.
    @NotBlank String descricao,

    // Guarda o preço do consumo.
    //
    // @NotNull impede que o valor seja esquecido.
    // @DecimalMin("0.01") impede valor zero ou negativo.
    @NotNull @DecimalMin("0.01") BigDecimal valor
) {}
