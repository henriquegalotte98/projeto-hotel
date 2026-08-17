// Define o pacote onde a classe Reserva está localizada.
package br.com.jprog.hotel.model;


// Importa o enum StatusReserva.
// Esse enum representa os possíveis estados de uma reserva,
// como RESERVADA, CANCELADA, FINALIZADA etc.
import br.com.jprog.hotel.model.enums.StatusReserva;


// Importa as anotações do JPA/Hibernate,
// como @Entity, @Table, @Id, @Column, @ManyToOne etc.
import jakarta.persistence.*;


// Importa LocalDate.
// LocalDate armazena apenas uma data, sem horário.
// Exemplo: 10/08/2026.
import java.time.LocalDate;


// Importa LocalDateTime.
// LocalDateTime armazena data e horário.
// Exemplo: 10/08/2026 às 14:30.
import java.time.LocalDateTime;


// Indica que esta classe é uma entidade do banco de dados.
//
// Ou seja, objetos da classe Reserva poderão ser
// armazenados como registros em uma tabela.
@Entity


// Define o nome da tabela correspondente a esta entidade.
//
// Nesse caso, a tabela no banco será chamada "reserva".
@Table(name = "reserva")


// Declara a classe Reserva.
public class Reserva {


    // Indica que este atributo é a chave primária da tabela.
    @Id

    // Indica que o valor do ID será gerado automaticamente
    // pelo banco de dados.
    //
    // GenerationType.IDENTITY normalmente utiliza
    // AUTO_INCREMENT ou equivalente no banco.
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    // Armazena o identificador único da reserva.
    private Long id;


    // Define um relacionamento Muitos-para-Um.
    //
    // Muitas reservas podem estar associadas
    // a um mesmo hóspede.
    //
    // optional = false:
    // significa que uma reserva obrigatoriamente precisa ter um hóspede.
    //
    // fetch = FetchType.EAGER:
    // significa que, ao carregar uma Reserva,
    // o Hibernate também carregará o Hospede imediatamente.
    @ManyToOne(optional = false, fetch = FetchType.EAGER)

    // Define a coluna que será usada como chave estrangeira.
    //
    // No banco, a tabela reserva terá uma coluna chamada:
    //
    // hospede_id
    //
    // nullable = false significa que ela não pode ser nula.
    @JoinColumn(name = "hospede_cpf", nullable = false)

    // Armazena o hóspede relacionado à reserva.
    private Hospede hospede;


    // Define outro relacionamento Muitos-para-Um.
    //
    // Muitas reservas podem estar relacionadas
    // ao mesmo quarto em períodos diferentes.
    //
    // Uma reserva obrigatoriamente precisa possuir um quarto.
    @ManyToOne(optional = false, fetch = FetchType.EAGER)

    // Define a chave estrangeira do quarto.
    //
    // A coluna no banco será chamada "quarto_id".
    @JoinColumn(name = "quarto_id", nullable = false)

    // Armazena o quarto associado à reserva.
    private Quarto quarto;


    // Define o nome da coluna correspondente
    // à data prevista para o check-in.
    //
    // nullable = false significa que esta data
    // precisa obrigatoriamente existir.
    @Column(name = "data_checkin_prevista", nullable = false)

    // Armazena a data prevista de entrada do hóspede.
    //
    // Como é LocalDate, armazena somente a data,
    // sem horário.
    private LocalDate dataCheckinPrevista;


    // Define a coluna que armazenará
    // a data prevista para o checkout.
    //
    // Essa informação também é obrigatória.
    @Column(name = "data_checkout_prevista", nullable = false)

    // Armazena a data prevista para a saída do hóspede.
    private LocalDate dataCheckoutPrevista;


    // Define o nome da coluna que armazenará
    // a data e horário reais do check-in.
    //
    // Como nullable não foi definido como false,
    // esse campo pode ficar vazio.
    //
    // Isso é útil porque, antes do hóspede entrar,
    // ainda não existe uma data real de check-in.
    @Column(name = "data_checkin_real")

    // Armazena a data e o horário em que
    // o hóspede realmente realizou o check-in.
    private LocalDateTime dataCheckinReal;


    // Define a coluna que armazenará
    // a data e horário reais do checkout.
    //
    // Também pode ser nula enquanto o checkout
    // ainda não tiver sido realizado.
    @Column(name = "data_checkout_real")

    // Armazena a data e o horário reais
    // em que o hóspede deixou o hotel.
    private LocalDateTime dataCheckoutReal;


    // Informa ao JPA como o enum será salvo no banco.
    //
    // EnumType.STRING faz com que seja salvo o texto do enum.
    //
    // Exemplo:
    //
    // RESERVADA
    // CANCELADA
    // FINALIZADA
    //
    // Isso é melhor do que salvar números como 0, 1, 2.
    @Enumerated(EnumType.STRING)

    // Define as características da coluna "status".
    //
    // nullable = false:
    // o status é obrigatório.
    //
    // length = 20:
    // permite até 20 caracteres.
    @Column(nullable = false, length = 20)

    // Armazena o status atual da reserva.
    //
    // Toda nova Reserva começa automaticamente
    // com o status RESERVADA.
    private StatusReserva status = StatusReserva.RESERVADA;


    // Getter do ID.
    //
    // Permite obter o identificador da reserva.
    public Long getId() {

        // Retorna o valor do atributo id.
        return id;
    }


    // Setter do ID.
    //
    // Permite alterar o valor do identificador.
    public void setId(Long id) {

        // "this.id" representa o atributo da classe.
        //
        // "id" representa o valor recebido pelo método.
        this.id = id;
    }


    // Getter do hóspede.
    //
    // Retorna o hóspede relacionado à reserva.
    public Hospede getHospede() {

        // Retorna o objeto Hospede.
        return hospede;
    }


    // Setter do hóspede.
    //
    // Permite definir qual hóspede pertence à reserva.
    public void setHospede(Hospede hospede) {

        // Define o hóspede da reserva.
        this.hospede = hospede;
    }


    // Getter do quarto.
    //
    // Retorna o quarto associado à reserva.
    public Quarto getQuarto() {

        // Retorna o objeto Quarto.
        return quarto;
    }


    // Setter do quarto.
    //
    // Permite definir o quarto da reserva.
    public void setQuarto(Quarto quarto) {

        // Define o quarto associado.
        this.quarto = quarto;
    }


    // Getter da data prevista de check-in.
    public LocalDate getDataCheckinPrevista() {

        // Retorna a data prevista de entrada.
        return dataCheckinPrevista;
    }


    // Setter da data prevista de check-in.
    public void setDataCheckinPrevista(LocalDate dataCheckinPrevista) {

        // Define a data prevista para a entrada.
        this.dataCheckinPrevista = dataCheckinPrevista;
    }


    // Getter da data prevista de checkout.
    public LocalDate getDataCheckoutPrevista() {

        // Retorna a data prevista para a saída.
        return dataCheckoutPrevista;
    }


    // Setter da data prevista de checkout.
    public void setDataCheckoutPrevista(LocalDate dataCheckoutPrevista) {

        // Define a data prevista para a saída.
        this.dataCheckoutPrevista = dataCheckoutPrevista;
    }


    // Getter da data real de check-in.
    public LocalDateTime getDataCheckinReal() {

        // Retorna a data e horário em que
        // o check-in realmente aconteceu.
        return dataCheckinReal;
    }


    // Setter da data real de check-in.
    public void setDataCheckinReal(LocalDateTime dataCheckinReal) {

        // Define a data e horário reais do check-in.
        this.dataCheckinReal = dataCheckinReal;
    }


    // Getter da data real de checkout.
    public LocalDateTime getDataCheckoutReal() {

        // Retorna a data e horário reais do checkout.
        return dataCheckoutReal;
    }


    // Setter da data real de checkout.
    public void setDataCheckoutReal(LocalDateTime dataCheckoutReal) {

        // Define a data e horário reais do checkout.
        this.dataCheckoutReal = dataCheckoutReal;
    }


    // Getter do status da reserva.
    public StatusReserva getStatus() {

        // Retorna o status atual.
        return status;
    }


    // Setter do status da reserva.
    public void setStatus(StatusReserva status) {

        // Altera o status atual da reserva.
        this.status = status;
    }
}
