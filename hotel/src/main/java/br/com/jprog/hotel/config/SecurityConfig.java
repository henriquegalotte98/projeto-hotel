package br.com.jprog.hotel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Desativa CSRF
            .csrf(csrf -> csrf.disable())
            
            // Usa a configuração de CORS personalizada que criamos abaixo
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/",
                        "/index.html",
                        "/html/**",
                        "/css/**",
                        "/js/**",
                        "/assets/**",
                        "/api/health",
                        "/api/auth/login",
                        "/api/auth/logout"
                ).permitAll()
                .requestMatchers("/api/usuarios/**").hasRole("ADMIN")
                .requestMatchers("/api/relatorios/**", "/api/dashboard/**").hasRole("ADMIN")
                .requestMatchers("/api/governanca/**").hasAnyRole("ADMIN", "GOVERNANCA")
                .requestMatchers("/api/manutencao/**").hasAnyRole("ADMIN", "MANUTENCAO")
                .requestMatchers("/api/hospedes/**", "/api/reservas/**", "/api/consumos/**")
                        .hasAnyRole("ADMIN", "RECEPCIONISTA")
                .requestMatchers("/api/quartos/**").authenticated()
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) ->
                        res.sendError(HttpStatus.UNAUTHORIZED.value(), "Não autenticado"))
                .accessDeniedHandler((req, res, e) ->
                        res.sendError(HttpStatus.FORBIDDEN.value(), "Acesso negado"))
            )
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())
            .logout(logout -> logout
                .logoutUrl("/api/auth/logout")
                .logoutSuccessHandler((req, res, auth) -> res.setStatus(204))
            );

        return http.build();
    }

    // 👉 ESTA É A CONFIGURAÇÃO DE CORS QUE VAI RESOLVER O SEU ERRO
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Permite qualquer origem (incluindo 127.0.0.1:5500 do Live Server)
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); 
        
        // Permite todos os métodos HTTP (GET, POST, PUT, DELETE, OPTIONS)
        configuration.setAllowedMethods(Arrays.asList("*"));
        
        // Permite todos os cabeçalhos
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Permite enviar cookies e credenciais
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}