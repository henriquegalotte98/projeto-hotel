// Define o pacote deste arquivo.
// Ele precisa ser igual à estrutura de pastas do projeto.
package br.com.jprog.hotel.repository;

// Importa a entidade Reserva.
// É a classe que representa uma reserva no banco de dados.
import br.com.jprog.hotel.model.Reserva;

// Importa os possíveis estados de uma reserva,
// por exemplo: RESERVADA, CHECKIN, CANCELADA.
import br.com.jprog.hotel.model.enums.StatusReserva;

// Importa JpaRepository.
// Ele fornece operações prontas, como salvar, listar,
// buscar por ID e excluir reservas.
import org.springframework.data.jpa.repository.JpaRepository;

// Importa @Query.
// Ela permite escrever consultas JPQL personalizadas.
import org.springframework.data.jpa.repository.Query;

// Importa @Param.
// Ela liga os parâmetros Java aos nomes usados nas consultas.
import org.springframework.data.repository.query.Param;

// Importa LocalDate.
// É usado para representar datas sem horário.
import java.time.LocalDate;

// Importa List.
// É usado quando uma consulta devolve várias reservas.
import java.util.List;

// Cria o repositório de Reserva.
//
// Reserva: entidade que este repositório manipula.
// Long: tipo do ID da entidade Reserva.
//
// JpaRepository já fornece métodos como:
// save(), findAll(), findById(), deleteById() etc.
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // Cria automaticamente uma consulta para buscar
    // todas as reservas de um hóspede pelo ID dele.
    //
    // Exemplo: findByHospedeId(5L)
    // Busca reservas cujo hospede.id seja 5.
    List<Reserva> findByHospedeId(Long hospedeId);

    // Cria automaticamente uma consulta para buscar
    // todas as reservas de um quarto pelo ID dele.
    //
    // Exemplo: findByQuartoId(3L)
    // Busca reservas cujo quarto.id seja 3.
    List<Reserva> findByQuartoId(Long quartoId);

    // Cria automaticamente uma consulta para buscar reservas
    // cuja data prevista de check-in esteja entre duas datas.
    //
    // Between inclui a data inicial e a data final.
    List<Reserva> findByDataCheckinPrevistaBetween(
        LocalDate inicio,
        LocalDate fim
    );

    // Conta quantas reservas possuem um status específico.
    //
    // Exemplo: countByStatus(StatusReserva.RESERVADA)
    // Retorna a quantidade de reservas com status RESERVADA.
    long countByStatus(StatusReserva status);

    // Cria uma consulta JPQL personalizada.
    //
    // JPQL consulta classes Java e atributos Java:
    // Reserva, r.quarto.id, r.status etc.
    //
    // Não usa os nomes das tabelas ou colunas do banco diretamente.
    @Query("""
        select count(r) > 0 from Reserva r
        where r.quarto.id = :quartoId
          and r.status in (
              br.com.jprog.hotel.model.enums.StatusReserva.RESERVADA,
              br.com.jprog.hotel.model.enums.StatusReserva.CHECKIN
          )
          and :inicio < r.dataCheckoutPrevista
          and :fim > r.dataCheckinPrevista
          and (:ignorarId is null or r.id <> :ignorarId)
    """)

    // Declara o método que executará a consulta de conflito.
    boolean existeConflito(

        // Recebe o ID do quarto que será reservado.
        @Param("quartoId") Long quartoId,

        // Recebe a data prevista de check-in.
        @Param("inicio") LocalDate inicio,

        // Recebe a data prevista de checkout.
        @Param("fim") LocalDate fim,

        // Recebe o ID da reserva a ignorar durante uma edição.
        // Em uma reserva nova, será null.
        @Param("ignorarId") Long ignorarId
    );

    // Cria outra consulta JPQL personalizada.
    //
    // Ela busca reservas que possuem qualquer sobreposição
    // com o período informado.
    @Query("""
        select r from Reserva r
        where r.dataCheckinPrevista <= :fim
          and r.dataCheckoutPrevista >= :inicio
    """)

    // Declara o método para listar reservas dentro de um período.
    List<Reserva> findNoPeriodo(

        // Data inicial do filtro.
        @Param("inicio") LocalDate inicio,

        // Data final do filtro.
        @Param("fim") LocalDate fim
    );
}
