// Define o pacote onde esta classe está localizada.
// O pacote ajuda a organizar as classes do projeto.
package br.com.jprog.hotel;


// Importa a classe SpringApplication.
// Ela é responsável por iniciar a aplicação Spring Boot.
import org.springframework.boot.SpringApplication;

// Importa a anotação @SpringBootApplication.
// Essa anotação configura a classe como ponto principal da aplicação Spring Boot.
import org.springframework.boot.autoconfigure.SpringBootApplication;


// Indica que esta é a classe principal de uma aplicação Spring Boot.
//
// @SpringBootApplication reúne três configurações principais:
// @Configuration -> permite configurações do Spring.
// @EnableAutoConfiguration -> configura automaticamente o Spring Boot.
// @ComponentScan -> procura componentes, controllers, services etc. no projeto.
@SpringBootApplication

// Declara a classe principal da aplicação.
public class Usuario {

    // Método main, responsável por iniciar a aplicação Java.
    // É o primeiro método executado quando o projeto é iniciado.
    public static void main(String[] args) {

        // Inicializa o Spring Boot.
        //
        // HotelwebApplication.class informa qual é a classe principal.
        // args recebe possíveis argumentos passados ao iniciar a aplicação.
        //
        // Depois dessa linha, o Spring começa a carregar as configurações,
        // controllers, services, repositories e demais componentes do sistema.
        SpringApplication.run(Usuario.class, args);
    }
}
