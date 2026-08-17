package br.com.jprog.hotel.service;

import br.com.jprog.hotel.dto.ReservaRequest;
import br.com.jprog.hotel.exception.RecursoNaoEncontradoException;
import br.com.jprog.hotel.exception.RegraNegocioException;
import br.com.jprog.hotel.model.Hospede;
import br.com.jprog.hotel.model.Quarto;
import br.com.jprog.hotel.model.Reserva;
import br.com.jprog.hotel.model.enums.StatusLimpeza;
import br.com.jprog.hotel.model.enums.StatusOcupacao;
import br.com.jprog.hotel.model.enums.StatusReserva;
import br.com.jprog.hotel.repository.HospedeRepository;
import br.com.jprog.hotel.repository.QuartoRepository;
import br.com.jprog.hotel.repository.ReservaRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReservaService {
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

    public List<Reserva> listar() { return repository.findAll(); }

    public Reserva buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Reserva não encontrada"));
    }

    @Transactional
    public Reserva criar(ReservaRequest req) {
        validarDatas(req.dataCheckinPrevista(), req.dataCheckoutPrevista());

        Hospede hospede = hospedeRepository.findById(req.hospedeCpf())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Hóspede não encontrado"));
        Quarto quarto = quartoRepository.findById(req.quartoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Quarto não encontrado"));

        if (quarto.getStatusOcupacao() == StatusOcupacao.MANUTENCAO) {
            throw new RegraNegocioException("Quarto em manutenção não pode ser reservado");
        }
        if (repository.existeConflito(quarto.getId(), req.dataCheckinPrevista(),
                req.dataCheckoutPrevista(), null)) {
            throw new RegraNegocioException("Quarto indisponível no período informado");
        }

        Reserva reserva = new Reserva();
        reserva.setHospede(hospede);
        reserva.setQuarto(quarto);
        reserva.setDataCheckinPrevista(req.dataCheckinPrevista());
        reserva.setDataCheckoutPrevista(req.dataCheckoutPrevista());
        reserva.setStatus(StatusReserva.RESERVADA);
        return repository.save(reserva);
    }

    public List<Reserva> porHospede(String cpf) { return repository.findByHospedeCpf(cpf); }
    public List<Reserva> porQuarto(Long id) { return repository.findByQuartoId(id); }

    public List<Reserva> porPeriodo(LocalDate inicio, LocalDate fim) {
        validarDatas(inicio, fim);
        return repository.findNoPeriodo(inicio, fim);
    }

    @Transactional
    public Reserva cancelar(Long id) {
        Reserva reserva = buscar(id);
        if (reserva.getStatus() != StatusReserva.RESERVADA) {
            throw new RegraNegocioException("Somente reserva RESERVADA pode ser cancelada");
        }
        reserva.setStatus(StatusReserva.CANCELADA);
        return repository.save(reserva);
    }

    @Transactional
    public Reserva checkin(Long id) {
        Reserva reserva = buscar(id);
        if (reserva.getStatus() != StatusReserva.RESERVADA) {
            throw new RegraNegocioException("Check-in permitido somente para reserva RESERVADA");
        }
        Quarto quarto = reserva.getQuarto();
        if (quarto.getStatusOcupacao() == StatusOcupacao.MANUTENCAO) {
            throw new RegraNegocioException("Quarto em manutenção");
        }
        reserva.setStatus(StatusReserva.CHECKIN);
        reserva.setDataCheckinReal(LocalDateTime.now());
        quarto.setStatusOcupacao(StatusOcupacao.OCUPADO);
        quartoRepository.save(quarto);
        return repository.save(reserva);
    }

    @Transactional
    public Reserva checkout(Long id) {
        Reserva reserva = buscar(id);
        if (reserva.getStatus() != StatusReserva.CHECKIN) {
            throw new RegraNegocioException("Check-out permitido somente para reserva em CHECKIN");
        }
        reserva.setStatus(StatusReserva.FINALIZADA);
        reserva.setDataCheckoutReal(LocalDateTime.now());
        Quarto quarto = reserva.getQuarto();
        quarto.setStatusOcupacao(StatusOcupacao.DISPONIVEL);
        quarto.setStatusLimpeza(StatusLimpeza.SUJO);
        quartoRepository.save(quarto);
        return repository.save(reserva);
    }

    private void validarDatas(LocalDate inicio, LocalDate fim) {
        if (inicio == null || fim == null || !fim.isAfter(inicio)) {
            throw new RegraNegocioException("Data de check-out deve ser posterior ao check-in");
        }
    }
}
