package br.com.jprog.hotel.service;

import br.com.jprog.hotel.dto.ReservaRequest;
import br.com.jprog.hotel.dto.CheckoutResumoResponse;
import br.com.jprog.hotel.model.ConsumoExtra;
import br.com.jprog.hotel.model.Reserva;
import br.com.jprog.hotel.model.enums.StatusOcupacao;
import br.com.jprog.hotel.model.enums.StatusReserva;
import br.com.jprog.hotel.exception.RegraNegocioException;
import br.com.jprog.hotel.repository.HospedeRepository;
import br.com.jprog.hotel.repository.QuartoRepository;
import br.com.jprog.hotel.repository.ReservaRepository;
import br.com.jprog.hotel.repository.ConsumoExtraRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ReservaService {
    private final ReservaRepository repository;
    private final HospedeRepository hospedes;
    private final QuartoRepository quartos;
    private final ConsumoExtraRepository consumos;

    public ReservaService(ReservaRepository repository, HospedeRepository hospedes, QuartoRepository quartos,
                          ConsumoExtraRepository consumos) {
        this.repository = repository;
        this.hospedes = hospedes;
        this.quartos = quartos;
        this.consumos = consumos;
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
    @Transactional
    public Reserva checkout(Long id) {
        Reserva r = buscar(id);
        if (r.getStatus() != StatusReserva.CHECKIN) {
            throw new RegraNegocioException("O check-out exige que o check-in tenha sido realizado");
        }
        r.setStatus(StatusReserva.FINALIZADA);
        r.setDataCheckoutReal(LocalDateTime.now());
        r.getQuarto().setStatusOcupacao(StatusOcupacao.DISPONIVEL);
        quartos.save(r.getQuarto());
        return repository.save(r);
    }

    @Transactional(readOnly = true)
    public CheckoutResumoResponse resumoCheckout(Long id) {
        Reserva reserva = buscar(id);
        if (reserva.getStatus() != StatusReserva.CHECKIN) {
            throw new RegraNegocioException("O resumo do check-out exige uma hospedagem em andamento");
        }

        LocalDate entrada = reserva.getDataCheckinReal() != null
                ? reserva.getDataCheckinReal().toLocalDate()
                : reserva.getDataCheckinPrevista();
        long quantidadeDiarias = Math.max(1, ChronoUnit.DAYS.between(entrada, LocalDate.now()));
        BigDecimal valorDiaria = reserva.getQuarto().getValorDiaria();
        BigDecimal totalDiarias = valorDiaria.multiply(BigDecimal.valueOf(quantidadeDiarias));
        List<ConsumoExtra> itens = consumos.findByReservaId(id);
        BigDecimal totalConsumos = itens.stream()
                .map(ConsumoExtra::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        List<CheckoutResumoResponse.ConsumoItem> itensResposta = itens.stream()
                .map(item -> new CheckoutResumoResponse.ConsumoItem(
                        item.getId(), item.getDescricao(), item.getValor(), item.getDataLancamento()))
                .toList();

        return new CheckoutResumoResponse(id, quantidadeDiarias, valorDiaria, totalDiarias,
                itensResposta, totalConsumos, totalDiarias.add(totalConsumos));
    }
}
