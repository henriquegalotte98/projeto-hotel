package br.com.jprog.hotel.service;

import br.com.jprog.hotel.dto.ConsumoRequest;
import br.com.jprog.hotel.exception.RecursoNaoEncontradoException;
import br.com.jprog.hotel.exception.RegraNegocioException;
import br.com.jprog.hotel.model.ConsumoExtra;
import br.com.jprog.hotel.model.Reserva;
import br.com.jprog.hotel.model.enums.StatusReserva;
import br.com.jprog.hotel.repository.ConsumoExtraRepository;
import br.com.jprog.hotel.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/** Gerencia os itens extras lancados durante uma hospedagem. */
@Service
public class ConsumoExtraService {
    private final ConsumoExtraRepository repository;
    private final ReservaRepository reservas;

    public ConsumoExtraService(ConsumoExtraRepository repository, ReservaRepository reservas) {
        this.repository = repository;
        this.reservas = reservas;
    }

    @Transactional(readOnly = true)
    public List<ConsumoExtra> listarPorReserva(Long reservaId) {
        buscarReserva(reservaId);
        return repository.findByReservaId(reservaId);
    }

    @Transactional(readOnly = true)
    public ConsumoExtra buscar(Long id) {
        return repository.findById(id).orElseThrow(() ->
                new RecursoNaoEncontradoException("Consumo extra nao encontrado: " + id));
    }

    @Transactional
    public ConsumoExtra lancar(ConsumoRequest request) {
        Reserva reserva = buscarReserva(request.reservaId());
        if (reserva.getStatus() != StatusReserva.CHECKIN) {
            throw new RegraNegocioException("Consumos so podem ser lancados em reservas com check-in realizado");
        }
        ConsumoExtra consumo = new ConsumoExtra();
        consumo.setReserva(reserva);
        consumo.setDescricao(request.descricao().trim());
        consumo.setValor(request.valor());
        consumo.setDataLancamento(LocalDateTime.now());
        return repository.save(consumo);
    }

    @Transactional(readOnly = true)
    public BigDecimal totalDaReserva(Long reservaId) {
        return listarPorReserva(reservaId).stream()
                .map(ConsumoExtra::getValor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    public void excluir(Long id) { repository.delete(buscar(id)); }

    private Reserva buscarReserva(Long id) {
        return reservas.findById(id).orElseThrow(() ->
                new RecursoNaoEncontradoException("Reserva nao encontrada: " + id));
    }
}
