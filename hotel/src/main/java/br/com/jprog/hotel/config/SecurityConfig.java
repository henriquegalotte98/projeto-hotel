// Define o pacote onde a classe SecurityConfig está localizada.
package br.com.jprog.hotel.config;


// Importa anotações do Spring,
// como @Configuration e @Bean.
import org.springframework.context.annotation.*;


// Importa os códigos de status HTTP.
//
// Nesta classe serão utilizados, por exemplo:
// 401 UNAUTHORIZED
// 403 FORBIDDEN
import org.springframework.http.HttpStatus;


// Importa Customizer,
// utilizado para aplicar configurações padrão do Spring.
import org.springframework.security.config.Customizer;


// Importa a anotação que permite utilizar
// segurança diretamente nos métodos.
//
// Exemplo:
// @PreAuthorize("hasRole('ADMIN')")
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;


// Importa a classe utilizada para configurar
// a segurança das requisições HTTP.
import org.springframework.security.config.annotation.web.builders.HttpSecurity;


// Importa as classes relacionadas ao BCrypt.
//
// BCrypt é utilizado para gerar hashes seguros das senhas.
import org.springframework.security.crypto.bcrypt.*;


// Importa a interface responsável
// pela codificação das senhas.
import org.springframework.security.crypto.password.PasswordEncoder;


// Importa a cadeia de filtros de segurança do Spring.
//
// Ela define quais regras serão aplicadas
// antes que uma requisição chegue ao Controller.
import org.springframework.security.web.SecurityFilterChain;


// Indica que esta classe contém
// configurações do Spring.
@Configuration


// Ativa a possibilidade de controlar acesso
// também através de anotações nos métodos.
//
// Exemplo:
//
// @PreAuthorize("hasRole('ADMIN')")
@EnableMethodSecurity


// Declara a classe de configuração de segurança.
public class SecurityConfig {


    // @Bean informa ao Spring que o objeto retornado
    // por este método deverá ser gerenciado pelo próprio Spring.
    @Bean

    // Cria o componente responsável
    // pela codificação das senhas.
    PasswordEncoder passwordEncoder() {


        // Retorna uma implementação que utiliza BCrypt.
        //
        // Em vez de salvar uma senha diretamente:
        //
        // 123456
        //
        // será armazenado um hash parecido com:
        //
        // $2a$10$...
        //
        // Assim, a senha original não fica armazenada
        // diretamente no banco de dados.
        return new BCryptPasswordEncoder();
    }


    // Cria o filtro principal de segurança
    // utilizado pelo Spring Security.
    @Bean

    // Recebe o objeto HttpSecurity,
    // utilizado para configurar as regras da API.
    //
    // throws Exception indica que esse método
    // pode gerar uma exceção durante a configuração.
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {


        // Inicia a configuração da segurança HTTP.
        http


            // Desativa a proteção CSRF.
            //
            // CSRF significa Cross-Site Request Forgery.
            //
            // Em APIs REST, especialmente quando a autenticação
            // não depende de cookies de sessão, é comum desativá-lo.
            .csrf(csrf -> csrf.disable())


            // Ativa o CORS utilizando
            // as configurações padrão do Spring.
            //
            // CORS controla quais origens podem
            // realizar requisições para esta API.
            .cors(Customizer.withDefaults())


            // Inicia a configuração das regras
            // de autorização dos endpoints.
            .authorizeHttpRequests(auth -> auth


                // Libera estes endpoints para qualquer pessoa.
                //
                // Não é necessário estar autenticado.
                //
                // /api/health
                // → verifica se a API está funcionando.
                //
                // /api/auth/login
                // → realiza o login.
                .requestMatchers(
                        "/api/health",
                        "/api/auth/login"
                ).permitAll()


                // Somente usuários com a role ADMIN
                // podem acessar endpoints de usuários.
                //
                // O ** significa qualquer caminho depois
                // de /api/usuarios/.
                //
                // Exemplos:
                //
                // /api/usuarios
                // /api/usuarios/1
                // /api/usuarios/10
                .requestMatchers("/api/usuarios/**")
                .hasRole("ADMIN")


                // Somente ADMIN pode acessar
                // relatórios e o dashboard.
                .requestMatchers(
                        "/api/relatorios/**",
                        "/api/dashboard/**"
                )
                .hasRole("ADMIN")


                // Os endpoints de governança podem
                // ser acessados por:
                //
                // ADMIN
                // ou
                // GOVERNANCA
                .requestMatchers("/api/governanca/**")
                .hasAnyRole("ADMIN", "GOVERNANCA")


                // Os endpoints de manutenção podem
                // ser acessados por:
                //
                // ADMIN
                // ou
                // MANUTENCAO
                .requestMatchers("/api/manutencao/**")
                .hasAnyRole("ADMIN", "MANUTENCAO")


                // Os endpoints relacionados a hóspedes,
                // reservas e consumos podem ser acessados por:
                //
                // ADMIN
                // ou
                // RECEPCIONISTA
                .requestMatchers(
                        "/api/hospedes/**",
                        "/api/reservas/**",
                        "/api/consumos/**"
                )
                .hasAnyRole("ADMIN", "RECEPCIONISTA")


                // Para acessar informações dos quartos,
                // basta que o usuário esteja autenticado.
                //
                // Não importa especificamente qual seja sua role.
                .requestMatchers("/api/quartos/**")
                .authenticated()


                // Qualquer outro endpoint que não tenha
                // sido configurado anteriormente também
                // exige que o usuário esteja autenticado.
                .anyRequest()
                .authenticated()
            )


            // Configura o tratamento de erros
            // relacionados à segurança.
            .exceptionHandling(ex -> ex


                // Define o que acontece quando alguém
                // tenta acessar um recurso sem estar autenticado.
                //
                // Retorna HTTP 401 - Unauthorized.
                .authenticationEntryPoint(
                        (req, res, e) ->
                                res.sendError(
                                        HttpStatus.UNAUTHORIZED.value(),
                                        "Não autenticado"
                                )
                )


                // Define o que acontece quando o usuário
                // está autenticado, mas não possui
                // permissão para acessar aquele recurso.
                //
                // Retorna HTTP 403 - Forbidden.
                .accessDeniedHandler(
                        (req, res, e) ->
                                res.sendError(
                                        HttpStatus.FORBIDDEN.value(),
                                        "Acesso negado"
                                )
                )
            )


            // Desativa o formulário de login
            // padrão fornecido pelo Spring Security.
            //
            // Isso faz sentido porque a aplicação
            // possui seu próprio endpoint:
            //
            // /api/auth/login
            .formLogin(form -> form.disable())


            // Desativa a autenticação HTTP Basic.
            //
            // Assim, o sistema não utilizará aquele
            // modelo tradicional de usuário e senha
            // enviados no cabeçalho Authorization Basic.
            .httpBasic(basic -> basic.disable())


            // Configura o logout da aplicação.
            .logout(logout -> logout


                // Define o endpoint utilizado para logout.
                //
                // /api/auth/logout
                .logoutUrl("/api/auth/logout")


                // Define o que acontece depois
                // que o logout é realizado com sucesso.
                .logoutSuccessHandler(

                        // Define o status HTTP da resposta como 204.
                        //
                        // HTTP 204 - No Content
                        //
                        // Significa que o logout foi realizado
                        // com sucesso e não há conteúdo para retornar.
                        (req, res, auth) ->
                                res.setStatus(204)
                )
            );


        // Finaliza todas as configurações anteriores
        // e cria o SecurityFilterChain.
        //
        // Esse objeto será utilizado pelo Spring Security
        // para proteger as requisições da aplicação.
        return http.build();
    }
}
