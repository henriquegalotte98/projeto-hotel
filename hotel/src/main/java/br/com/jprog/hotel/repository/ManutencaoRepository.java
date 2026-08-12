package br.com.jprog.hotel.repository;
// 🏠 Diz onde este arquivo está guardado.
// É como dizer: "Essa é a casa do ManutencaoRepository."

import br.com.jprog.hotel.model.SolicitacaoManutencao;
// 🔧 Traz a informação da solicitação de manutenção.
// É o tipo de dado que esse Repository vai cuidar.

import br.com.jprog.hotel.model.enums.StatusManutencao;
// 🚧 Traz os possíveis estados de uma manutenção.
// Por exemplo: ABERTA, EM_ANDAMENTO, CONCLUIDA etc.
// Os nomes exatos dependem do seu projeto.

import org.springframework.data.jpa.repository.JpaRepository;
// 🧰 Traz uma caixa de ferramentas pronta.
// Ela já sabe salvar, procurar, atualizar e apagar informações no banco.

import java.util.List;
// 📋 Permite trabalhar com uma lista de várias manutenções.


public interface ManutencaoRepository
        extends JpaRepository<SolicitacaoManutencao, Long> {
// 🧑‍🔧 Cria o ajudante responsável pelas manutenções.
//
// SolicitacaoManutencao → é o tipo de informação que vamos guardar.
// Long → é o tipo do ID da solicitação.
// JpaRepository → fornece várias funções prontas para conversar com o banco.


    List<SolicitacaoManutencao>
        findByQuartoIdOrderByDataAberturaDesc(Long quartoId);
    // 🏨🔎 Procura todas as solicitações de manutenção
    // de um determinado quarto.
    //
    // "findByQuartoId" significa:
    // 👉 procure pelo ID do quarto.
    //
    // "OrderByDataAberturaDesc" significa:
    // 👉 organize pela data de abertura,
    // começando da mais recente para a mais antiga.
    //
    // Como podem existir várias solicitações,
    // usamos uma List.


    List<SolicitacaoManutencao> findByStatus(StatusManutencao status);
    // 🔎 Procura todas as manutenções que possuem
    // determinado status.
    //
    // Por exemplo:
    // "Me mostre todas as manutenções que estão ABERTAS."
    //
    // Como podem existir várias,
    // usamos uma List.


    long countByStatus(StatusManutencao status);
    // 🔢 Conta quantas solicitações possuem
    // determinado status.
    //
    // Por exemplo:
    // "Quantas manutenções estão ABERTAS?"
    //
    // O resultado será um número.


}
// 🚪 Fim do ManutencaoRepository.


/*O ManutencaoRepository é como um funcionário
que cuida das solicitações de manutenção do hotel. 🧑‍🔧🏨

Ele consegue fazer 3 coisas principais:

🏨🔎 findByQuartoIdOrderByDataAberturaDesc()
→ Procura as manutenções de um quarto
→ E coloca as mais recentes primeiro.

🔎 findByStatus()
→ Procura manutenções pelo status.
→ Exemplo: todas as manutenções ABERTAS.

🔢 countByStatus()
→ Conta quantas manutenções possuem determinado status.

E como ele usa JpaRepository, ele também já consegue
salvar, procurar, atualizar e apagar solicitações.

"O ManutencaoRepository ajuda o sistema a conversar
com o banco para encontrar e contar as manutenções
dos quartos."
*/