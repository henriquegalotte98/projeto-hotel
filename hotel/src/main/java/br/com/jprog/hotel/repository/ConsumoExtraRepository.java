package br.com.jprog.hotel.repository;
// 🏠 Diz onde este arquivo está guardado.
// É como dizer o endereço da casa do nosso Repository.


import br.com.jprog.hotel.model.ConsumoExtra;
// 🍔🧃 Traz o modelo ConsumoExtra.
// Ele representa coisas extras que o hóspede pode consumir,
// como comida, bebida, serviço de quarto etc.


import org.springframework.data.jpa.repository.JpaRepository;
// 🧰 Traz uma caixa de ferramentas pronta.
// Ela já sabe salvar, procurar, atualizar e apagar dados no banco.


import org.springframework.data.jpa.repository.Query;
// 🔎 Permite criar uma pergunta personalizada para o banco.
// É como ensinar uma pergunta nova ao nosso ajudante.


import org.springframework.data.repository.query.Param;
// 🏷️ Ajuda a colocar nomes nos valores que usamos
// dentro das perguntas personalizadas.


import java.math.BigDecimal;
// 💰 Usamos BigDecimal para trabalhar com dinheiro
// de forma mais precisa.


import java.time.LocalDateTime;
// 🕐 Permite trabalhar com data e horário.


import java.util.List;
// 📋 Permite trabalhar com uma lista de vários resultados.



public interface ConsumoExtraRepository
        extends JpaRepository<ConsumoExtra, Long> {
// 🧑‍💼 Cria o ajudante responsável pelos consumos extras.
//
// ConsumoExtra → é o tipo de informação que ele vai cuidar.
// Long → é o tipo do ID.
// JpaRepository → já fornece várias funções prontas
// para conversar com o banco.



    List<ConsumoExtra> findByReservaId(Long reservaId);
    // 🔎 Procura todos os consumos extras de uma reserva.
    //
    // Por exemplo:
    // "Quais coisas extras foram consumidas na reserva número 5?"
    //
    // Como uma reserva pode ter vários consumos,
    // usamos uma List.



    @Query("""
        select co.descricao, count(co), sum(co.valor)
        from ConsumoExtra co
        where co.dataLancamento between :inicio and :fim
        group by co.descricao
        order by count(co) desc
    """)
    // 🧠 Aqui estamos criando uma pergunta personalizada para o banco.
    //
    // Estamos dizendo:
    //
    // "Pegue os consumos extras feitos entre duas datas,
    // agrupe os consumos pelo nome,
    // conte quantas vezes cada um apareceu
    // e some o dinheiro de cada tipo."
    //
    // Exemplo:
    //
    // 🍕 Pizza → 10 pedidos → R$ 300
    // 🥤 Refrigerante → 15 pedidos → R$ 150
    //
    // E depois coloque os mais pedidos primeiro.


    List<Object[]> relatorioItens(
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim
    );
    // 📊 Cria um relatório dos itens consumidos.
    //
    // "inicio" = começo do período.
    // "fim" = final do período.
    //
    // Object[] significa que cada resultado pode ter
    // várias informações juntas.
    //
    // Nesse caso:
    // 1️⃣ descrição do item
    // 2️⃣ quantidade de vezes que apareceu
    // 3️⃣ soma dos valores
    //
    // Por isso o resultado é uma List de Object[].



    @Query("""
        select coalesce(sum(co.valor), 0)
        from ConsumoExtra co
        where co.dataLancamento between :inicio and :fim
    """)
    // 💰 Aqui fazemos outra pergunta personalizada.
    //
    // Estamos dizendo:
    //
    // "Some o valor de todos os consumos extras
    // feitos entre essas duas datas."
    //
    // coalesce(..., 0) significa:
    // 👉 se não existir nenhum consumo,
    // em vez de deixar vazio, coloque 0.


    BigDecimal totalNoPeriodo(
        @Param("inicio") LocalDateTime inicio,
        @Param("fim") LocalDateTime fim
    );
    // 💰 Devolve o total de dinheiro gasto
    // com consumos extras naquele período.
    //
    // BigDecimal é usado porque estamos trabalhando com dinheiro.

}
/*O ConsumoExtraRepository é como um funcionário
que cuida das compras extras dos hóspedes. 🧑‍💼🏨

Ele consegue fazer 3 coisas principais:

1️⃣ findByReservaId()
🔎
"Quais consumos extras pertencem a esta reserva?"

--------------------------------------------------

2️⃣ relatorioItens()
📊
"Quais itens foram consumidos em determinado período,
quantas vezes cada um foi comprado e quanto dinheiro
eles geraram?"

Por exemplo:

🍕 Pizza
→ 10 pedidos
→ R$ 300

🥤 Refrigerante
→ 15 pedidos
→ R$ 150

--------------------------------------------------

3️⃣ totalNoPeriodo()
💰
"Quanto dinheiro foi gasto em consumos extras
durante determinado período?"

Por exemplo:

📅 Agosto
→ Total: R$ 2.500

--------------------------------------------------

E como ele usa JpaRepository, também pode:

📥 salvar
🔎 procurar
✏️ atualizar
🗑️ apagar

"O ConsumoExtraRepository é o funcionário que conversa
com o banco para cuidar dos consumos extras e fazer
relatórios sobre eles."
*/