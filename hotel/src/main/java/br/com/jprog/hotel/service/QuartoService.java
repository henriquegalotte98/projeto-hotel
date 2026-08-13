package br.com.jprog.hotel.service;

import br.com.jprog.hotel.model.Quarto;
import br.com.jprog.hotel.model.enums.StatusLimpeza;
import br.com.jprog.hotel.model.enums.StatusOcupacao;
import br.com.jprog.hotel.model.enums.StatusReserva;
import br.com.jprog.hotel.repository.QuartoRepository;
import br.com.jprog.hotel.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Centraliza as regras de negócio relacionadas aos quartos do hotel.
 *
 * <p>O serviço coordena a persistência dos quartos e consulta as reservas
 * antes de permitir operações que possam violar as regras do domínio.</p>
 */
@Service
public class QuartoService {

    /** Repositório usado nas operações de consulta e persistência de quartos. */
    private final QuartoRepository quartoRepository;

    /** Repositório usado para verificar reservas associadas a um quarto. */
    private final ReservaRepository reservaRepository;

    /**
     * Cria o serviço com suas dependências obrigatórias.
     */
    public QuartoService(QuartoRepository quartoRepository, ReservaRepository reservaRepository) {
        this.quartoRepository = quartoRepository;
        this.reservaRepository = reservaRepository;
    }

    /**
     * Retorna todos os quartos cadastrados, sem impor ordenação adicional.
     */
    @Transactional(readOnly = true)
    public List<Quarto> listar() {
        return quartoRepository.findAll();
    }

    /**
     * Busca um quarto pelo identificador.
     *
     * @throws IllegalArgumentException quando o quarto não existe
     */
    @Transactional(readOnly = true)
    public Quarto buscar(Long id) {
        return quartoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Quarto não encontrado: " + id));
    }

    /** Retorna os quartos que possuem o status de ocupação informado. */
    @Transactional(readOnly = true)
    public List<Quarto> porOcupacao(StatusOcupacao statusOcupacao) {
        return quartoRepository.findByStatusOcupacao(statusOcupacao);
    }

    /** Retorna os quartos que possuem o status de limpeza informado. */
    @Transactional(readOnly = true)
    public List<Quarto> porLimpeza(StatusLimpeza statusLimpeza) {
        return quartoRepository.findByStatusLimpeza(statusLimpeza);
    }

    /**
     * Cadastra um novo quarto.
     *
     * <p>O identificador recebido é descartado para garantir que ele seja
     * gerado pelo banco. O número do quarto deve ser único.</p>
     */
    @Transactional
    public Quarto criar(Quarto quarto) {
        if (quartoRepository.existsByNumero(quarto.getNumero())) {
            throw new IllegalArgumentException("Já existe um quarto com o número " + quarto.getNumero());
        }
        quarto.setId(null);
        return quartoRepository.save(quarto);
    }

    /**
     * Atualiza os dados permitidos de um quarto existente.
     *
     * <p>A entidade persistida é carregada antes da cópia dos campos para
     * preservar sua identidade e impedir a criação silenciosa de registros.</p>
     */
    @Transactional
    public Quarto atualizar(Long id, Quarto dados) {
        Quarto quarto = buscar(id);

        if (!quarto.getNumero().equals(dados.getNumero())
                && quartoRepository.existsByNumero(dados.getNumero())) {
            throw new IllegalArgumentException("Já existe um quarto com o número " + dados.getNumero());
        }

        quarto.setNumero(dados.getNumero());
        quarto.setTipo(dados.getTipo());
        quarto.setValorDiaria(dados.getValorDiaria());
        quarto.setIncluiCafeDaManha(dados.isIncluiCafeDaManha());
        quarto.setStatusOcupacao(dados.getStatusOcupacao());
        quarto.setStatusLimpeza(dados.getStatusLimpeza());
        return quartoRepository.save(quarto);
    }

    /**
     * Exclui um quarto quando não existe reserva ativa vinculada.
     *
     * <p>Nesta implementação, uma reserva com status {@code RESERVADA}
     * representa uma reserva ativa.</p>
     *
     * @throws IllegalStateException quando o quarto possui reserva ativa
     */
    @Transactional
    public void excluir(Long id) {
        Quarto quarto = buscar(id);
        if (reservaRepository.existsByQuartoIdAndStatus(id, StatusReserva.RESERVADA)) {
            throw new IllegalStateException("Quarto não pode ser excluído porque possui reserva ativa");
        }
        quartoRepository.delete(quarto);
    }

    /**
     * Altera somente o status de limpeza do quarto informado.
     *
     * <p>O método não impõe uma sequência de transições; essa validação
     * deve ser adicionada apenas quando houver uma regra de domínio definida.</p>
     */
    @Transactional
    public Quarto atualizarStatusLimpeza(Long id, StatusLimpeza novoStatus) {
        Quarto quarto = buscar(id);
        quarto.setStatusLimpeza(novoStatus);
        return quartoRepository.save(quarto);
    }

    public Quarto atualizarLimpeza(Long id, StatusLimpeza novoStatus) {
        return atualizarStatusLimpeza(id, novoStatus);
    }
}
