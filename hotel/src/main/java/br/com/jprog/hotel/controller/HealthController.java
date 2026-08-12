// Define o pacote onde a classe HealthController está localizada.
package br.com.jprog.hotel.controller;


// Importa as anotações do Spring utilizadas
// para criar Controllers e endpoints REST.
import org.springframework.web.bind.annotation.*;


// Importa a interface Map do Java.
// Map trabalha com informações no formato chave → valor.
import java.util.Map;


// Indica que esta classe é um Controller REST.
//
// Isso permite que ela receba requisições HTTP
// e retorne dados, normalmente em formato JSON.
@RestController


// Define o endereço principal deste Controller.
//
// Todos os endpoints desta classe começarão com:
//
// /api/health
@RequestMapping("/api/health")


// Declara a classe HealthController.
//
// Esse Controller é utilizado para verificar
// se a aplicação está funcionando.
public class HealthController {


    // Define que este método responde
    // a requisições HTTP do tipo GET.
    //
    // Como nenhum caminho adicional foi informado,
    // o endereço será:
    //
    // GET /api/health
    @GetMapping

    // Declara o método health().
    //
    // O retorno é um Map<String, String>.
    //
    // Isso significa que tanto as chaves
    // quanto os valores serão Strings.
    public Map<String, String> health() {


        // Map.of() cria um Map contendo
        // pares de chave e valor.
        //
        // "status" → "UP"
        // informa que a aplicação está funcionando.
        //
        // "service" → "hotelweb"
        // identifica qual serviço está respondendo.
        return Map.of(
                "status", "UP",
                "service", "hotelweb"
        );
    }
}
