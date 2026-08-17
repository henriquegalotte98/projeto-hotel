package br.com.jprog.hotel.service;

import br.com.hotelweb.dto.ReservaRequest;
import br.com.hotelweb.exception.*;
import br.com.hotelweb.model.*;
import br.com.hotelweb.model.enums.*;
import br.com.hotelweb.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.List;

@Service
public class ReservaService {
    private final ReservaRepository repository;
    private final HospedeRepository hospedes;
    private final QuartoRepository quartos;

    public ReservaService(ReservaRepository repository, HospedeRepository hospedes, QuartoRepository quartos) {
        this.repository = repository;
        this.hospedes = hospedes;
        this.quartos = quartos;
    }

    public List<Reserva> listar() { return repository.findAll(); }
    public List<Reserva> porHospede(String cpf) { return repository.findByHospedeCpf(cpf); }
    public List<Reserva> porQuarto(Long id) { return repository.findByQuartoId(id); }
    public List<Reserva> porPeriodo(LocalDate inicio, LocalDate fim) { return repository.findNoPeriodo(inicio, fim); }
    public Reserva buscar(Long id) { return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Reserva nao encontrada: " + id)); }

    @Transactional
    public Reserva criar(ReservaRequest req) {
        if (!req.dataCheckoutPrevista().isAfter(req.dataCheckinPrevista())) throw new IllegalArgumentException("Checkout deve ser posterior ao check-in");
        if (repository.existeConflito(req.quartoId(), req.dataCheckinPrevista(), req.dataCheckoutPrevista(), null)) throw new IllegalStateException("Quarto indisponivel no periodo");
        Reserva r = new Reserva();
        r.setHospede(hospedes.findById(req.hospedeCpf()).orElseThrow(() -> new IllegalArgumentException("Hospede nao encontrado")));
        r.setQuarto(quartos.findById(req.quartoId()).orElseThrow(() -> new IllegalArgumentException("Quarto nao encontrado")));
        r.setDataCheckinPrevista(req.dataCheckinPrevista());
        r.setDataCheckoutPrevista(req.dataCheckoutPrevista());
        return repository.save(r);
    }

    // Repositórios usados para acessar reservas, hóspedes e quartos.
    private final ReservaRepository repository;
    private final HospedeRepository hospedeRepository;
    private final QuartoRepository quartoRepository;

    public ReservaService(ReservaRepository repository,
                          HospedeRepository hospedeRepository,
                          QuartoRepository quartoRepository) {
        this.repository = repository;
        this.hospedeRepository = hospedeRepository;
        this.quartoRepository = quartoRepository;
    }

    // Lista todas as reservas.
    public List<Reserva> listar() {
        return repository.findAll();
    }

    // Busca uma reserva pelo ID.
    public Reserva buscar(Long id) {
        return repository.findById(id)
            .orElseThrow(() ->
                new RecursoNaoEncontradoException("Reserva não encontrada"));
    }

    // Cria uma nova reserva validando datas e disponibilidade.
    @Transactional
    public Reserva criar(ReservaRequest req) {
        validarDatas(req.dataCheckinPrevista(), req.dataCheckoutPrevista());

        Hospede hospede = hospedeRepository.findById(req.hospedeId())
            .orElseThrow(() ->
                new RecursoNaoEncontradoException("Hóspede não encontrado"));

        Quarto quarto = quartoRepository.findById(req.quartoId())
            .orElseThrow(() ->
                new RecursoNaoEncontradoException("Quarto não encontrado"));

        // Impede reserva de quarto em manutenção.
        if (quarto.getStatusOcupacao() == StatusOcupacao.MANUTENCAO) {
            throw new RegraNegocioException(
                "Quarto em manutenção não pode ser reservado");
        }

        // Impede conflito de reservas no mesmo período.
        if (repository.existeConflito(
                quarto.getId(),
                req.dataCheckinPrevista(),
                req.dataCheckoutPrevista(),
                null)) {
            throw new RegraNegocioException(
                "Quarto indisponível no período informado");
        }

        Reserva r = new Reserva();
        r.setHospede(hospede);
        r.setQuarto(quarto);
        r.setDataCheckinPrevista(req.dataCheckinPrevista());
        r.setDataCheckoutPrevista(req.dataCheckoutPrevista());
        r.setStatus(StatusReserva.RESERVADA);

        return repository.save(r);
    }

    // Busca reservas por hóspede.
    public List<Reserva> porHospede(Long id) {
        return repository.findByHospedeId(id);
    }

    // Busca reservas por quarto.
    public List<Reserva> porQuarto(Long id) {
        return repository.findByQuartoId(id);
    }

    // Busca reservas dentro de um período.
    public List<Reserva> porPeriodo(LocalDate inicio, LocalDate fim) {
        validarDatas(inicio, fim);
        return repository.findNoPeriodo(inicio, fim);
    }

    // Cancela uma reserva que ainda está reservada.
    @Transactional
    public Reserva cancelar(Long id) {
        Reserva r = buscar(id);

        if (r.getStatus() != StatusReserva.RESERVADA) {
            throw new RegraNegocioException(
                "Somente reserva RESERVADA pode ser cancelada");
        }

        r.setStatus(StatusReserva.CANCELADA);
        return repository.save(r);
    }

    // Realiza o check-in e marca o quarto como ocupado.
    @Transactional
    public Reserva checkin(Long id) {
        Reserva r = buscar(id);

        if (r.getStatus() != StatusReserva.RESERVADA) {
            throw new RegraNegocioException(
                "Check-in permitido somente para reserva RESERVADA");
        }

        Quarto q = r.getQuarto();

        if (q.getStatusOcupacao() == StatusOcupacao.MANUTENCAO) {
            throw new RegraNegocioException("Quarto em manutenção");
        }

        r.setStatus(StatusReserva.CHECKIN);
        r.setDataCheckinReal(LocalDateTime.now());

        q.setStatusOcupacao(StatusOcupacao.OCUPADO);
        quartoRepository.save(q);

        return repository.save(r);
    }

    // Realiza o check-out e libera o quarto para limpeza.
    @Transactional
    public Reserva checkout(Long id) {
        Reserva r = buscar(id);

        if (r.getStatus() != StatusReserva.CHECKIN) {
            throw new RegraNegocioException(
                "Check-out permitido somente para reserva em CHECKIN");
        }

        r.setStatus(StatusReserva.FINALIZADA);
        r.setDataCheckoutReal(LocalDateTime.now());

        Quarto q = r.getQuarto();
        q.setStatusOcupacao(StatusOcupacao.DISPONIVEL);
        q.setStatusLimpeza(StatusLimpeza.SUJO);

        quartoRepository.save(q);
        return repository.save(r);
    }

    // Valida se o check-out ocorre depois do check-in.
    private void validarDatas(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null || !fim.isAfter(inicio)) {
            throw new RegraNegocioException(
                "Data de check-out deve ser posterior ao check-in");
        }
    }
}
