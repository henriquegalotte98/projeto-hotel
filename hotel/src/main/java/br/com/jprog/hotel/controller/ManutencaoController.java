// Define o pacote onde esta classe está localizada.
package br.com.jprog.hotel.controller;


// Importa o DTO usado para receber os dados
// necessários para abrir uma solicitação de manutenção.
import br.com.jprog.hotel.dto.ManutencaoRequest;


// Importa a entidade que representa uma solicitação de manutenção.
import br.com.hotelweb.model.SolicitacaoManutencao;


// Importa o enum que representa os possíveis
// status de uma manutenção.
import br.com.hotelweb.model.enums.StatusManutencao;


// Importa o Service responsável pelas regras
// de negócio relacionadas à manutenção.
import br.com.hotelweb.service.ManutencaoService;


// Importa a anotação @Valid,
// usada para validar os dados recebidos na requisição.
import jakarta.validation.Valid;


// Importa classes HTTP,
// como ResponseEntity.
import org.springframework.http.*;


// Importa as anotações usadas para criar endpoints REST,
// como @RestController, @GetMapping, @PostMapping,
// @PatchMapping, @DeleteMapping, @PathVariable etc.
import org.springframework.web.bind.annotation.*;


// Importa a interface List,
// usada para trabalhar com listas de solicitações.
import java.util.List;


// Indica que esta classe é um Controller REST.
//
// Os métodos desta classe receberão requisições HTTP
// e retornarão dados, geralmente em formato JSON.
@RestController


// Define o caminho principal deste Controller.
//
// Todos os endpoints começam com:
//
// /api/manutencao
@RequestMapping("/api/manutencao")


// Declara a classe responsável pelos endpoints de manutenção.
public class ManutencaoController {


    // Declara o ManutencaoService que será utilizado pelo Controller.
    //
    // "final" significa que essa referência não será alterada
    // depois de ser inicializada.
    private final ManutencaoService service;


    // Construtor da classe.
    //
    // O Spring usa esse construtor para fazer
    // a injeção de dependência do ManutencaoService.
    public ManutencaoController(ManutencaoService service) {

        // Armazena o Service recebido no atributo da classe.
        this.service = service;
    }


    // Define um endpoint HTTP GET.
    //
    // Como não há outro caminho informado,
    // o endpoint será:
    //
    // GET /api/manutencao
    @GetMapping

    // Método responsável por listar
    // todas as solicitações de manutenção.
    public List<SolicitacaoManutencao> listar() {

        // Chama o método listar() do Service
        // e retorna todas as solicitações encontradas.
        return service.listar();
    }


    // Define um endpoint GET que recebe
    // o ID de um quarto pela URL.
    //
    // Exemplo:
    //
    // GET /api/manutencao/quarto/5
    @GetMapping("/quarto/{quartoId}")

    // Método responsável por buscar
    // o histórico de manutenção de um quarto.
    public List<SolicitacaoManutencao> historico(

            // @PathVariable pega o valor informado
            // no lugar de "{quartoId}" na URL.
            @PathVariable Long quartoId) {

        // Chama o Service para buscar todas
        // as manutenções relacionadas ao quarto informado.
        return service.historicoQuarto(quartoId);
    }


    // Define um endpoint HTTP POST.
    //
    // Endpoint:
    //
    // POST /api/manutencao
    //
    // É usado para abrir uma nova solicitação de manutenção.
    @PostMapping

    // ResponseEntity permite controlar
    // o conteúdo e o código HTTP da resposta.
    public ResponseEntity<SolicitacaoManutencao> abrir(

            // @Valid faz a validação dos dados
            // recebidos antes de executar o método.
            @Valid

            // @RequestBody pega o JSON recebido
            // e transforma em um objeto ManutencaoRequest.
            @RequestBody ManutencaoRequest req) {

        // Chama o método abrir() do Service
        // para criar a solicitação de manutenção.
        //
        // status(201) retorna HTTP 201 - Created,
        // indicando que um novo recurso foi criado.
        //
        // body(...) coloca a solicitação criada
        // no corpo da resposta.
        return ResponseEntity
                .status(201)
                .body(service.abrir(req));
    }


    // Define um endpoint HTTP PATCH.
    //
    // PATCH normalmente é usado para atualizar
    // apenas uma parte de um recurso.
    //
    // Neste caso, será alterado somente o status.
    //
    // Exemplo:
    //
    // PATCH /api/manutencao/10/status?status=CONCLUIDA
    @PatchMapping("/{id}/status")

    // Método responsável por atualizar
    // o status de uma solicitação de manutenção.
    public SolicitacaoManutencao status(

            // Recebe o ID da solicitação pela URL.
            //
            // No exemplo acima, seria o valor 10.
            @PathVariable Long id,

            // @RequestParam recebe um parâmetro
            // enviado na URL.
            //
            // Exemplo:
            //
            // ?status=CONCLUIDA
            //
            // O Spring tenta converter esse texto
            // automaticamente para StatusManutencao.
            @RequestParam StatusManutencao status) {

        // Chama o Service para atualizar
        // o status da solicitação informada.
        //
        // Retorna a solicitação já atualizada.
        return service.atualizarStatus(id, status);
    }


    // Define um endpoint HTTP DELETE.
    //
    // Exemplo:
    //
    // DELETE /api/manutencao/10
    @DeleteMapping("/{id}")

    // ResponseEntity<Void> indica que a resposta
    // não terá conteúdo no corpo.
    public ResponseEntity<Void> excluir(

            // Recebe o ID da solicitação
            // que será excluída.
            @PathVariable Long id) {

        // Chama o Service para excluir
        // a solicitação de manutenção.
        service.excluir(id);

        // Retorna HTTP 204 - No Content.
        //
        // Indica que a operação foi realizada
        // com sucesso, mas sem conteúdo na resposta.
        return ResponseEntity
                .noContent()
                .build();
    }
}
