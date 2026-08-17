package br.com.jprog.hotel.repository;
// 🏠 Diz onde este arquivo está guardado.
// É como dizer: "Essa é a casa do QuartoRepository."

import br.com.jprog.hotel.model.Quarto;
// 🛏️ Traz o Quarto para podermos trabalhar com os dados dos quartos.

import br.com.jprog.hotel.model.enums.StatusLimpeza;
// 🧹 Traz as opções de limpeza do quarto.
// Por exemplo: LIMPO, SUJO, EM_LIMPEZA etc.
// As opções exatas dependem do seu projeto.

import br.com.jprog.hotel.model.enums.StatusOcupacao;
// 👤 Traz as opções de ocupação do quarto.
// Por exemplo: OCUPADO, DISPONIVEL etc.
// As opções exatas dependem do seu projeto.

import org.springframework.data.jpa.repository.JpaRepository;
// 🧰 Traz uma "caixa de ferramentas" pronta.
// Ela já sabe salvar, procurar, atualizar e apagar dados no banco.

import java.util.List;
// 📋 Permite trabalhar com uma lista de vários quartos.

public interface QuartoRepository extends JpaRepository<Quarto, Long> {
// 🧑‍💼 Cria o ajudante que cuida dos quartos.
// Quarto = o tipo de informação que vamos guardar.
// Long = o tipo do ID do quarto.
// JpaRepository = dá várias funções prontas para conversar com o banco.

    boolean existsByNumero(String numero);
    // 🔎 Pergunta:
    // "Já existe um quarto com esse número?"
    //
    // true  = ✅ o quarto já existe
    // false = ❌ o quarto não existe

    List<Quarto> findByStatusOcupacao(StatusOcupacao status);
    // 🛏️🔎 Procura todos os quartos que possuem
    // determinado status de ocupação.
    //
    // Por exemplo:
    // "Me mostre todos os quartos OCUPADOS."
    //
    // Como pode encontrar vários quartos,
    // usamos uma List (lista).

    List<Quarto> findByStatusLimpeza(StatusLimpeza status);
    // Procura todos os quartos que possuem
    // determinado status de limpeza.
    //
    // Por exemplo:
    // "Me mostre todos os quartos que estão SUJOS."

    long countByStatusOcupacao(StatusOcupacao status);
    // Conta quantos quartos possuem determinado
    // status de ocupação.
    //
    // Por exemplo:
    // "Quantos quartos estão OCUPADOS?"
    //
    // O resultado é um número.

    long countByStatusLimpeza(StatusLimpeza status);
    // Conta quantos quartos possuem determinado
    // status de limpeza.
    //
    // Por exemplo:
    // "Quantos quartos estão LIMPOS?"
    //
    // O resultado também é um número.

import java.util.List;

/**
 * Contrato de persistência dos quartos.
 *
 * <p>Os nomes dos métodos seguem as convenções do Spring Data JPA, que
 * gera automaticamente as consultas a partir das propriedades da entidade.</p>
 */
public interface QuartoRepository extends JpaRepository<Quarto, Long> {
    /** Localiza quartos pelo status atual de ocupação. */
    List<Quarto> findByStatusOcupacao(StatusOcupacao statusOcupacao);

    /** Localiza quartos pelo status atual de limpeza. */
    List<Quarto> findByStatusLimpeza(StatusLimpeza statusLimpeza);

    /** Informa se o número indicado já pertence a algum quarto. */
    boolean existsByNumero(Integer numero);
}

/*O QuartoRepository é como um funcionário
que cuida de uma lista de quartos do hotel.

Ele consegue perguntar ao banco:

"Esse número de quarto já existe?"
    → existsByNumero()

"Quais quartos estão ocupados?"
    → findByStatusOcupacao()

"Quais quartos estão com determinado status de limpeza?"
    → findByStatusLimpeza()

"Quantos quartos estão ocupados?"
    → countByStatusOcupacao()

 "Quantos quartos estão com determinado status de limpeza?"
    → countByStatusLimpeza()

E como ele usa JpaRepository, ele também já consegue
salvar, procurar, atualizar e apagar quartos.

Em uma frase:

"Esse código é o funcionário que ajuda o sistema
a encontrar e contar os quartos do hotel."
*/