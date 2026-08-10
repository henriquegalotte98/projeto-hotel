// Define o pacote onde esta classe está localizada.
package br.com.jprog.hotel.controller;


// Importa a classe Quarto.
// Essa classe representa um quarto do hotel.
import br.com.jprog.hotel.model.Quarto;


// Importa todos os enums do pacote "enums".
// Neste Controller são usados, por exemplo:
// StatusOcupacao e StatusLimpeza.
import br.com.hotelweb.model.enums.*;


// Importa o QuartoService.
// O Service contém as regras de negócio relacionadas aos quartos.
import br.com.hotelweb.service.QuartoService;


// Importa a anotação @Valid.
// Ela faz com que os dados recebidos sejam validados.
import jakarta.validation.Valid;


// Importa classes relacionadas às respostas HTTP,
// como ResponseEntity.
import org.springframework.http.*;


// Importa as anotações utilizadas para criar endpoints REST,
// como @RestController, @GetMapping, @PostMapping,
// @RequestParam, @PathVariable etc.
import org.springframework.web.bind.annotation.*;


// Importa a interface List.
// Ela será usada para retornar listas de quartos.
import java.util.List;


// Indica que esta classe é um Controller REST.
//
// Isso significa que ela recebe requisições HTTP
// e normalmente retorna os dados em formato JSON.
@RestController


// Define o caminho principal deste Controller.
//
// Todos os endpoints desta classe começarão com:
//
// /api/quartos
@RequestMapping("/api/quartos")


// Declara a classe responsável pelos endpoints de quartos.
public class QuartoController {


    // Declara o QuartoService que será utilizado pelo Controller.
    //
    // "final" indica que a referência não poderá ser alterada
    // depois que for inicializada.
    private final QuartoService service;


    // Construtor da classe.
    //
    // O Spring utiliza esse construtor para injetar
    // automaticamente uma instância de QuartoService.
    public QuartoController(QuartoService service) {

        // Armazena o Service recebido no atributo da classe.
        this.service = service;
    }


    // Indica que este método responde a requisições GET.
    //
    // Como não existe outro caminho definido,
    // o endpoint será:
    //
    // GET /api/quartos
    @GetMapping

    // Método responsável por listar todos os quartos.
    public List<Quarto> listar() {

        // Chama o método listar() do QuartoService
        // e retorna a lista de quartos.
        return service.listar();
    }


    // Define um endpoint GET que recebe um ID na URL.
    //
    // Exemplo:
    //
    // GET /api/quartos/10
    @GetMapping("/{id}")

    // Método responsável por buscar um quarto pelo ID.
    public Quarto buscar(

            // @PathVariable pega o valor "{id}" informado na URL.
            @PathVariable Long id) {

        // Chama o Service para buscar o quarto correspondente.
        return service.buscar(id);
    }


    // Define um GET que será executado quando existir
    // o parâmetro "ocupacao" na URL.
    //
    // Exemplo:
    //
    // GET /api/quartos?ocupacao=LIVRE
    //
    // ou, dependendo do enum:
    //
    // GET /api/quartos?ocupacao=OCUPADO
    @GetMapping(params = "ocupacao")

    // Método que retorna quartos filtrados
    // pelo status de ocupação.
    public List<Quarto> ocupacao(

            // @RequestParam recebe o parâmetro da URL.
            //
            // O Spring tenta converter automaticamente o texto
            // recebido para o enum StatusOcupacao.
            @RequestParam StatusOcupacao ocupacao) {

        // Chama o Service para buscar quartos
        // com o status de ocupação informado.
        return service.porOcupacao(ocupacao);
    }


    // Define outro GET, mas este será executado
    // quando existir o parâmetro "limpeza".
    //
    // Exemplo:
    //
    // GET /api/quartos?limpeza=LIMPO
    //
    // ou:
    //
    // GET /api/quartos?limpeza=SUJO
    @GetMapping(params = "limpeza")

    // Método responsável por filtrar quartos
    // pelo status de limpeza.
    public List<Quarto> limpeza(

            // Recebe o parâmetro "limpeza" enviado pela URL
            // e converte para o enum StatusLimpeza.
            @RequestParam StatusLimpeza limpeza) {

        // Chama o Service para buscar os quartos
        // com o status de limpeza informado.
        return service.porLimpeza(limpeza);
    }


    // Define que este método responde a requisições POST.
    //
    // Endpoint:
    //
    // POST /api/quartos
    //
    // Normalmente é utilizado para cadastrar um novo quarto.
    @PostMapping

    // ResponseEntity permite controlar o conteúdo
    // e também o código HTTP retornado.
    public ResponseEntity<Quarto> criar(

            // @Valid faz a validação dos dados do Quarto.
            @Valid

            // @RequestBody pega o JSON enviado na requisição
            // e transforma em um objeto Quarto.
            @RequestBody Quarto q) {

        // Chama o Service para criar o quarto.
        //
        // status(201) retorna o código HTTP 201 - Created,
        // indicando que o recurso foi criado com sucesso.
        //
        // body(...) coloca o quarto criado no corpo da resposta.
        return ResponseEntity
                .status(201)
                .body(service.criar(q));
    }


    // Define um endpoint PUT.
    //
    // O PUT normalmente é usado para atualizar um recurso.
    //
    // Exemplo:
    //
    // PUT /api/quartos/10
    @PutMapping("/{id}")

    // Método responsável por atualizar um quarto.
    public Quarto atualizar(

            // Recebe o ID do quarto através da URL.
            @PathVariable Long id,

            // Solicita a validação dos novos dados.
            @Valid

            // Converte o JSON enviado para um objeto Quarto.
            @RequestBody Quarto q) {

        // Chama o Service para atualizar o quarto
        // correspondente ao ID informado.
        return service.atualizar(id, q);
    }


    // Define um endpoint DELETE.
    //
    // Exemplo:
    //
    // DELETE /api/quartos/10
    @DeleteMapping("/{id}")

    // ResponseEntity<Void> indica que a resposta
    // não terá conteúdo no corpo.
    public ResponseEntity<Void> excluir(

            // Recebe o ID do quarto informado na URL.
            @PathVariable Long id) {

        // Chama o Service para excluir o quarto.
        service.excluir(id);

        // Retorna HTTP 204 - No Content.
        //
        // Significa que a operação foi realizada com sucesso,
        // mas não existe nenhum conteúdo para retornar.
        return ResponseEntity
                .noContent()
                .build();
    }
}
