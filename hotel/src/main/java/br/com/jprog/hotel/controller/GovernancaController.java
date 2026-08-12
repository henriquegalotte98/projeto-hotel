// Define o pacote deste arquivo.
// Ele precisa corresponder à pasta:
// src/main/java/br/com/jprog/hotel/controller
package br.com.jprog.hotel.controller;

// Importa a classe Quarto.
// Ela representa os dados de um quarto do hotel.
import br.com.jprog.hotel.model.Quarto;

// Importa o enum que contém os possíveis status de limpeza,
// por exemplo: SUJO, EM_LIMPEZA, LIMPO e INSPECIONADO.
import br.com.jprog.hotel.model.enums.StatusLimpeza;

// Importa o serviço que contém as regras de negócio dos quartos.
import br.com.jprog.hotel.service.QuartoService;

// Importa as anotações do Spring para criar endpoints REST.
import org.springframework.web.bind.annotation.*;

// Importa List, usada para devolver uma lista de quartos.
import java.util.List;

// Informa ao Spring que esta classe é um controller REST.
// Os retornos dos métodos serão convertidos para JSON.
@RestController

// Define o caminho base de todos os endpoints desta classe.
// Todos começarão com: /api/governanca
@RequestMapping("/api/governanca")

// Declara a classe que concentra as rotas usadas pela governança.
public class GovernancaController {

    // Guarda o serviço de quartos.
    // "final" significa que ele só será definido no construtor.
    private final QuartoService service;

    // Construtor da classe.
    // O Spring entrega automaticamente um QuartoService pronto.
    public GovernancaController(QuartoService service) {

        // Salva o serviço recebido no atributo da classe.
        this.service = service;
    }

    // Cria o endpoint GET /api/governanca/quartos.
    // Ele será usado para consultar/listar os quartos.
    @GetMapping("/quartos")

    // Declara o método que será executado no GET.
    // Ele devolve uma lista de objetos Quarto.
    public List<Quarto> quartos() {

        // Chama o método listar() do serviço.
        // O service busca os quartos e o Spring transforma a lista em JSON.
        return service.listar();
    }

    // Cria o endpoint PATCH:
    // /api/governanca/quartos/{id}/limpeza
    //
    // PATCH é usado para atualizar somente uma parte do recurso:
    // neste caso, apenas o status de limpeza do quarto.
    @PatchMapping("/quartos/{id}/limpeza")

    // Declara o método que atualiza o status de limpeza.
    public Quarto atualizar(

            // Obtém o valor {id} presente na URL.
            // Exemplo: /quartos/3/limpeza gera id = 3.
            @PathVariable Long id,

            // Obtém o parâmetro "status" da URL.
            // Exemplo: ?status=EM_LIMPEZA.
            //
            // O Spring converte o texto para o enum StatusLimpeza.
            @RequestParam StatusLimpeza status
    ) {

        // Delega a atualização ao serviço.
        // O serviço deve localizar o quarto pelo id, alterar o status
        // e devolver o quarto atualizado.
        return service.atualizarLimpeza(id, status);
    }
}
