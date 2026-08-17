// Define o pacote onde esta classe está localizada.
// Como é um Controller, ela fica dentro do pacote "controller".
package br.com.jprog.hotel.controller;


// Importa a classe Usuario, que representa o usuário no sistema.
import br.com.jprog.hotel.model.Usuario;

// Importa o UsuarioService.
// O Service contém as regras de negócio relacionadas aos usuários.
import br.com.jprog.hotel.service.UsuarioService;

// Importa a anotação @Valid.
// Ela faz o Spring validar os dados recebidos antes de executar o método.
import jakarta.validation.Valid;

// Importa classes relacionadas às respostas HTTP,
// como ResponseEntity e HttpStatus.
import org.springframework.http.*;

// Importa as anotações usadas para criar endpoints REST,
// como @RestController, @GetMapping, @PostMapping etc.
import org.springframework.web.bind.annotation.*;

// Importa a interface List.
// Ela será usada para retornar uma lista de usuários.
import java.util.List;


// Indica que esta classe é um Controller REST.
//
// Isso significa que os métodos desta classe poderão
// receber requisições HTTP e retornar dados em JSON.
@RestController

// Define o caminho principal dos endpoints deste Controller.
//
// Todos os endpoints abaixo começarão com:
//
// /api/usuarios
@RequestMapping("/api/usuarios")

// Declara a classe responsável pelos endpoints de usuários.
public class UsuarioController {


    // Declara o UsuarioService que será utilizado pelo Controller.
    //
    // "final" significa que essa referência não poderá ser alterada
    // depois de receber seu valor.
    private final UsuarioService service;


    // Construtor da classe.
    //
    // O Spring utiliza esse construtor para fazer a
    // injeção de dependência do UsuarioService.
    public UsuarioController(UsuarioService service) {

        // Guarda o UsuarioService recebido dentro do atributo "service".
        this.service = service;
    }


    // Define que este método responde requisições HTTP GET.
    //
    // Como não foi informado outro caminho,
    // o endpoint será:
    //
    // GET /api/usuarios
    @GetMapping

    // Método que retorna uma lista de usuários.
    public List<Usuario> listar() {

        // Chama o método listar() do UsuarioService
        // e devolve a lista de usuários encontrada.
        return service.listar();
    }


    // Define um endpoint GET que recebe um ID pela URL.
    //
    // Exemplo:
    //
    // GET /api/usuarios/5
    @GetMapping("/{cpf}")

    // Método responsável por buscar um usuário específico.
    //
    // @PathVariable pega o valor "{id}" presente na URL
    // e coloca dentro da variável "id".
    public Usuario buscar(@PathVariable String cpf) {

        // Chama o Service para procurar o usuário pelo ID.
        return service.buscar(cpf);
    }


    // Define que este método responde requisições HTTP POST.
    //
    // Endpoint:
    //
    // POST /api/usuarios
    //
    // Normalmente é usado para cadastrar um novo usuário.
    @PostMapping

    // ResponseEntity permite controlar tanto o conteúdo da resposta
    // quanto o código HTTP retornado.
    public ResponseEntity<Usuario> criar(

            // @Valid manda validar os dados do Usuario
            // de acordo com as validações presentes na classe Usuario.
            @Valid

            // @RequestBody pega os dados JSON enviados na requisição
            // e transforma em um objeto Usuario.
            @RequestBody Usuario u) {

        // Chama o método criar() do UsuarioService.
        //
        // HttpStatus.CREATED representa o código HTTP 201,
        // indicando que um novo recurso foi criado com sucesso.
        //
        // body(...) coloca o usuário criado no corpo da resposta.
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.criar(u));
    }


    // Define que este método responde requisições HTTP PUT.
    //
    // O PUT normalmente é utilizado para atualizar um recurso.
    //
    // Exemplo:
    //
    // PUT /api/usuarios/5
    @PutMapping("/{cpf}")

    // Método responsável por atualizar um usuário.
    public Usuario atualizar(

            // Recebe o ID do usuário através da URL.
            @PathVariable String cpf,

            // Valida os novos dados enviados.
            @Valid

            // Converte o JSON recebido em um objeto Usuario.
            @RequestBody Usuario u) {

        // Chama o Service para atualizar o usuário
        // correspondente ao ID informado.
        return service.atualizar(cpf, u);
    }


    // Define que este método responde requisições HTTP DELETE.
    //
    // Exemplo:
    //
    // DELETE /api/usuarios/5
    @DeleteMapping("/{cpf}")

    // ResponseEntity<Void> significa que a resposta
    // não terá nenhum conteúdo no corpo.
    public ResponseEntity<Void> desativar(

            // Recebe o ID informado na URL.
            @PathVariable String cpf) {

        // Chama o método desativar() do Service.
        //
        // Pelo nome do método, provavelmente o usuário não é
        // excluído fisicamente do banco, apenas marcado como inativo.
        service.desativar(cpf);

        // Retorna HTTP 204 - No Content.
        //
        // Isso indica que a operação foi realizada com sucesso,
        // mas não existe conteúdo para retornar.
        return ResponseEntity
                .noContent()
                .build();
    }
}
