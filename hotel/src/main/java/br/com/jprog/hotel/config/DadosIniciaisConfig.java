// Define o pacote onde a classe DadosIniciaisConfig está localizada.
package br.com.jprog.hotel.config;


// Importa a entidade Usuario.
// Ela representa um usuário cadastrado no sistema.
import br.com.jprog.hotel.model.Usuario;


// Importa o enum Papel.
//
// Esse enum representa o tipo/perfil do usuário,
// como ADMIN, RECEPCIONISTA, GOVERNANCA etc.
import br.com.jprog.hotel.model.enums.Papel;


// Importa o Repository responsável
// pelo acesso aos dados dos usuários no banco.
import br.com.jprog.hotel.repository.UsuarioRepository;


// Importa CommandLineRunner.
//
// Ele permite executar um código automaticamente
// assim que a aplicação Spring Boot é iniciada.
import org.springframework.boot.CommandLineRunner;


// Importa anotações do Spring,
// como @Configuration e @Bean.
import org.springframework.context.annotation.*;


// Importa o PasswordEncoder.
//
// Ele será utilizado para criptografar/hash
// a senha do administrador antes de salvar no banco.
import org.springframework.security.crypto.password.PasswordEncoder;


// Indica que esta classe contém
// configurações utilizadas pelo Spring.
@Configuration


// Declara a classe responsável
// pela criação dos dados iniciais do sistema.
public class DadosIniciaisConfig {


    // @Bean informa que o objeto retornado por este método
    // será criado e gerenciado pelo Spring.
    @Bean


    // Declara um CommandLineRunner chamado criarAdminInicial.
    //
    // Esse código será executado automaticamente
    // quando a aplicação Spring Boot iniciar.
    //
    // O método recebe duas dependências:
    //
    // UsuarioRepository -> acesso aos usuários no banco.
    //
    // PasswordEncoder -> responsável por gerar
    // o hash seguro da senha.
    CommandLineRunner criarAdminInicial(
            UsuarioRepository repo,
            PasswordEncoder encoder) {


        // Retorna uma função que será executada
        // automaticamente durante a inicialização da aplicação.
        //
        // "args" representa possíveis argumentos
        // passados ao iniciar o programa.
        return args -> {


            // Procura no banco um usuário
            // com o CPF "00000000000".
            //
            // findByCpf() provavelmente retorna um Optional<Usuario>.
            //
            // isEmpty() verifica se nenhum usuário
            // com esse CPF foi encontrado.
            //
            // Portanto, o bloco abaixo só será executado
            // se o administrador ainda NÃO existir.
            if (repo.findByCpf("00000000000").isEmpty()) {


                // Cria um novo objeto Usuario.
                //
                // Neste momento ele existe apenas
                // na memória da aplicação.
                Usuario admin = new Usuario();


                // Define o nome do usuário administrador.
                admin.setNome("Administrador");


                // Define um CPF padrão para
                // identificar o administrador inicial.
                admin.setCpf("00000000000");

                admin.setEmail("admin@hotel.local");


                // Define a senha do administrador.
                //
                // IMPORTANTE:
                // "admin123" não é salva diretamente no banco.
                //
                // encoder.encode() transforma a senha
                // em um hash utilizando o PasswordEncoder
                // configurado no SecurityConfig.
                //
                // Como foi utilizado BCryptPasswordEncoder,
                // o banco receberá algo parecido com:
                //
                // $2a$10$.....
                admin.setSenha(
                        encoder.encode("admin123")
                );


                // Define o papel/perfil do usuário.
                //
                // Papel.ADMIN significa que esse usuário
                // terá permissões de administrador.
                admin.setPapel(Papel.ADMIN.name());


                // Define que o usuário está ativo.
                //
                // true significa que ele poderá
                // ser utilizado normalmente no sistema.
                admin.setAtivo(true);


                // Salva o objeto Usuario no banco de dados.
                //
                // Depois dessa linha, o administrador
                // passa a existir na tabela de usuários.
                repo.save(admin);
            }
        };
    }
}
