// Define o pacote onde a classe DashboardService está localizada.
package br.com.jprog.hotel.service;


// Importa a anotação @Service do Spring.
// Ela é usada para indicar que esta classe pertence
// à camada de serviços da aplicação.
import org.springframework.stereotype.Service;


// Importa LocalDate.
// Essa classe representa uma data sem horário,
// como 12/08/2026.
import java.time.LocalDate;


// Importa a interface Map.
// Map permite armazenar informações no formato chave → valor.
//
// Exemplo:
// "ocupacao" → dados de ocupação
// "reservas" → dados das reservas
import java.util.Map;


// Indica para o Spring que esta classe é um Service.
//
// Com isso, o Spring cria e gerencia automaticamente
// uma instância de DashboardService.
@Service


// Declara a classe responsável por montar
// as informações exibidas no Dashboard.
public class DashboardService {


    // Declara uma dependência do RelatorioService.
    //
    // O DashboardService utiliza os relatórios já existentes
    // para montar um resumo geral do hotel.
    //
    // "final" significa que a referência não poderá
    // ser alterada depois de inicializada.
    private final RelatorioService relatorios;


    // Construtor da classe.
    //
    // O Spring utiliza esse construtor para fazer
    // a injeção de dependência do RelatorioService.
    public DashboardService(RelatorioService relatorios) {

        // Guarda o RelatorioService recebido
        // dentro do atributo da classe.
        this.relatorios = relatorios;
    }


    // Declara o método responsável por gerar
    // o resumo de informações do Dashboard.
    //
    // O método recebe duas datas:
    //
    // inicio → início do período
    // fim    → final do período
    //
    // Essas datas são utilizadas principalmente
    // para calcular o faturamento do período.
    //
    // O retorno é um Map.
    //
    // String representa a chave:
    // "ocupacao", "reservas", "faturamento" etc.
    //
    // Object representa o valor associado à chave.
    // É usado porque cada relatório pode retornar
    // um tipo diferente de informação.
    public Map<String, Object> resumo(LocalDate inicio, LocalDate fim) {


        // Map.of() cria um Map contendo vários
        // pares de chave e valor.
        //
        // Esse Map será o resumo completo
        // utilizado pelo Dashboard.
        return Map.of(


            // Cria a chave "ocupacao".
            //
            // O valor é obtido chamando o método
            // ocupacao() do RelatorioService.
            "ocupacao", relatorios.ocupacao(),


            // Cria a chave "reservas".
            //
            // O valor contém as informações
            // relacionadas às reservas do hotel.
            "reservas", relatorios.reservas(),


            // Cria a chave "faturamento".
            //
            // Chama o relatório de faturamento
            // passando o período recebido pelo método.
            //
            // inicio → data inicial
            // fim    → data final
            "faturamento", relatorios.faturamento(inicio, fim),


            // Cria a chave "governanca".
            //
            // Busca informações relacionadas à governança,
            // como situação de limpeza dos quartos.
            "governanca", relatorios.governanca(),


            // Cria a chave "manutencao".
            //
            // Busca informações relacionadas
            // às solicitações de manutenção do hotel.
            "manutencao", relatorios.manutencao(),


            // Cria a chave "rankingQuartos".
            //
            // Busca o ranking dos quartos através
            // do RelatorioService.
            "rankingQuartos", relatorios.rankingQuartos()
        );
    }
}
