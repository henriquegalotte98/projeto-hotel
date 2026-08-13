// Diz em qual “gaveta” do projeto este arquivo fica.
// A gaveta é a pasta dto.
package br.com.jprog.hotel.dto;

// Pega uma regra que diz:
// “este texto não pode ficar vazio”.
import jakarta.validation.constraints.NotBlank;

// Pega uma regra que diz:
// “este número não pode faltar”.
import jakarta.validation.constraints.NotNull;

// Cria uma caixinha chamada ManutencaoRequest.
//
// Ela serve para receber, pela API, as informações
// necessárias para abrir um chamado de manutenção.
public record ManutencaoRequest(

    // Guarda o número de identificação do quarto.
    //
    // @NotNull impede que alguém envie o chamado
    // sem dizer qual quarto está com problema.
    @NotNull Long quartoId,

    // Guarda a explicação do problema.
    //
    // @NotBlank impede que a descrição seja vazia
    // ou tenha apenas espaços.
    @NotBlank String descricao
) {}