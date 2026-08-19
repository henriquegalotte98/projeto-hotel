package br.com.jprog.hotel.service;

import br.com.jprog.hotel.dto.ReservaRequest;
import br.com.jprog.hotel.model.Reserva;
import br.com.jprog.hotel.model.enums.StatusOcupacao;
import br.com.jprog.hotel.model.enums.StatusReserva;
import br.com.jprog.hotel.repository.HospedeRepository;
import br.com.jprog.hotel.repository.QuartoRepository;
import br.com.jprog.hotel.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    public List<Reserva> porHospede(Long id) { return repository.findByHospedeId(id); }
    public List<Reserva> porQuarto(Long id) { return repository.findByQuartoId(id); }
    public List<Reserva> porPeriodo(LocalDate inicio, LocalDate fim) { return repository.findNoPeriodo(inicio, fim); }
    public Reserva buscar(Long id) { return repository.findById(id).orElseThrow(() -> new IllegalArgumentException("Reserva nao encontrada: " + id)); }

    @Transactional
    public Reserva criar(ReservaRequest req) {
        if (!req.dataCheckoutPrevista().isAfter(req.dataCheckinPrevista())) throw new IllegalArgumentException("Checkout deve ser posterior ao check-in");
        if (repository.existeConflito(req.quartoId(), req.dataCheckinPrevista(), req.dataCheckoutPrevista(), null)) throw new IllegalStateException("Quarto indisponivel no periodo");
        Reserva r = new Reserva();
        r.setHospede(hospedes.findById(req.hospedeId()).orElseThrow(() -> new IllegalArgumentException("Hospede nao encontrado")));
        r.setQuarto(quartos.findById(req.quartoId()).orElseThrow(() -> new IllegalArgumentException("Quarto nao encontrado")));
        r.setDataCheckinPrevista(req.dataCheckinPrevista());
        r.setDataCheckoutPrevista(req.dataCheckoutPrevista());
        return repository.save(r);
    }

    @Transactional public Reserva cancelar(Long id) { Reserva r=buscar(id); r.setStatus(StatusReserva.CANCELADA); return repository.save(r); }
    @Transactional public Reserva checkin(Long id) { Reserva r=buscar(id); r.setStatus(StatusReserva.CHECKIN); r.setDataCheckinReal(LocalDateTime.now()); r.getQuarto().setStatusOcupacao(StatusOcupacao.OCUPADO); quartos.save(r.getQuarto()); return repository.save(r); }
    @Transactional public Reserva checkout(Long id) { Reserva r=buscar(id); r.setStatus(StatusReserva.FINALIZADA); r.setDataCheckoutReal(LocalDateTime.now()); r.getQuarto().setStatusOcupacao(StatusOcupacao.DISPONIVEL); quartos.save(r.getQuarto()); return repository.save(r); }
}
