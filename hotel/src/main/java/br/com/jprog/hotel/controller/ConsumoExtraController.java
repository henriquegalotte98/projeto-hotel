// Define o pacote onde esta classe está localizada.
// Como é um Controller, fica dentro do pacote "controller".
package br.com.jprog.hotel.controller;


// Importa o DTO ConsumoRequest.
// Esse objeto representa os dados que serão recebidos
// quando um novo consumo extra for registrado.
import br.com.jprog.hotel.dto.ConsumoRequest;


// Importa a entidade ConsumoExtra.
// Ela representa um consumo adicional realizado
// durante uma hospedagem/reserva.
import br.com.hotelweb.model.ConsumoExtra;


// Importa o Service responsável pelas regras
// de negócio relacionadas aos consumos extras.
import br.com.hotelweb.service.ConsumoExtraService;


// Importa a anotação @Valid.
// Ela permite validar os dados recebidos na requisição
// de acordo com as validações definidas no DTO.
import jakarta.validation.Valid;


// Importa classes relacionadas às respostas HTTP,
// como ResponseEntity.
import org.springframework.http.*;


// Importa as anotações utilizadas para criar endpoints REST,
// como @RestController, @RequestMapping, @GetMapping,
// @PostMapping, @PathVariable e @RequestBody.
import org.springframework.web.bind.annotation.*;


// Importa a interface List.
// Ela será utilizada para retornar uma lista de consumos.
import java.util.List;


// Indica que esta classe é um Controller REST.
//
// Os métodos desta classe recebem requisições HTTP
// e retornam dados, normalmente em formato JSON.
@RestController


// Define o caminho principal deste Controller.
//
// Todos os endpoints desta classe começarão com:
//
// /api/consumos
@RequestMapping("/api/consumos")


// Declara a classe responsável pelos endpoints
// relacionados aos consumos extras.
public class ConsumoExtraController {


    // Declara o ConsumoExtraService utilizado pelo Controller.
    //
    // O Controller recebe a requisição e delega
    // a regra de negócio para o Service.
    private final ConsumoExtraService service;


    // Construtor da classe.
    //
    // O Spring utiliza este construtor para realizar
    // a injeção de dependência do ConsumoExtraService.
    public ConsumoExtraController(ConsumoExtraService service) {

        // Armazena o Service recebido no atributo da classe.
        this.service = service;
    }


    // Define um endpoint HTTP GET.
    //
    // Esse endpoint recebe o ID de uma reserva.
    //
    // Exemplo:
    //
    // GET /api/consumos/reserva/5
    @GetMapping("/reserva/{id}")

    // Método responsável por listar os consumos extras
    // relacionados a uma determinada reserva.
    public List<ConsumoExtra> porReserva(

            // @PathVariable pega o valor "{id}"
            // diretamente da URL.
            //
            // No exemplo:
            //
            // /reserva/5
            //
            // id receberia o valor 5.
            @PathVariable Long id) {

        // Chama o método porReserva() do Service,
        // passando o ID da reserva.
        //
        // O Service retorna todos os consumos
        // relacionados àquela reserva.
        return service.porReserva(id);
    }


    // Define um endpoint HTTP POST.
    //
    // Endpoint:
    //
    // POST /api/consumos
    //
    // É utilizado para registrar um novo consumo extra.
    @PostMapping

    // ResponseEntity permite controlar tanto
    // o conteúdo quanto o código HTTP da resposta.
    //
    // O conteúdo retornado será um ConsumoExtra.
    public ResponseEntity<ConsumoExtra> lancar(

            // @Valid solicita que o Spring valide
            // os dados recebidos.
            @Valid

            // @RequestBody pega o JSON enviado
            // no corpo da requisição e transforma
            // em um objeto ConsumoRequest.
            @RequestBody ConsumoRequest req) {

        // Chama o método lancar() do Service
        // para registrar o novo consumo.
        //
        // status(201) retorna:
        //
        // HTTP 201 - Created
        //
        // indicando que o consumo foi criado com sucesso.
        //
        // body(...) coloca o ConsumoExtra criado
        // no corpo da resposta.
        return ResponseEntity
                .status(201)
                .body(service.lancar(req));
    }
}
