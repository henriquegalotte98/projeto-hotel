// Define o pacote onde o DTO ReservaRequest está localizado.
package br.com.jprog.hotel.dto;


// Importa a anotação @NotNull.
//
// Essa anotação indica que o campo é obrigatório
// e não pode receber um valor nulo.
import jakarta.validation.constraints.NotNull;


// Importa a classe LocalDate.
//
// LocalDate representa apenas uma data,
// sem armazenar horário.
//
// Exemplo: 20/08/2026.
import java.time.LocalDate;


// Declara um record chamado ReservaRequest.
//
// Um record é uma estrutura do Java utilizada
// principalmente para transportar dados.
//
// Neste caso, ele funciona como um DTO
// para receber os dados necessários para criar uma reserva.
public record ReservaRequest(


    // ID do hóspede que está realizando a reserva.
    //
    // @NotNull indica que o ID do hóspede
    // obrigatoriamente precisa ser informado.
    @NotNull Long hospedeId,


    // ID do quarto que será reservado.
    //
    // @NotNull indica que o quarto
    // obrigatoriamente precisa ser informado.
    @NotNull Long quartoId,


    // Data prevista para o check-in.
    //
    // Representa o dia em que o hóspede
    // deverá entrar no hotel.
    //
    // @NotNull torna esse campo obrigatório.
    @NotNull LocalDate dataCheckinPrevista,


    // Data prevista para o checkout.
    //
    // Representa o dia em que o hóspede
    // deverá deixar o hotel.
    //
    // @NotNull também torna esse campo obrigatório.
    @NotNull LocalDate dataCheckoutPrevista


// Finaliza a declaração do record.
//
// O corpo fica vazio porque o próprio Java
// gera automaticamente os métodos necessários.
) {}
