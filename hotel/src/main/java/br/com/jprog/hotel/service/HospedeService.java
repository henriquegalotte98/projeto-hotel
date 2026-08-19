package br.com.jprog.hotel.service;

import br.com.jprog.hotel.exception.RecursoNaoEncontradoException;
import br.com.jprog.hotel.exception.RegraNegocioException;
import br.com.jprog.hotel.model.Hospede;
import br.com.jprog.hotel.repository.HospedeRepository;
import br.com.jprog.hotel.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Aplica as regras de cadastro e manutencao dos hospedes. */
@Service
public class HospedeService {
    private final HospedeRepository repository;
    private final ReservaRepository reservaRepository;

    public HospedeService(HospedeRepository repository, ReservaRepository reservaRepository) {
        this.repository = repository;
        this.reservaRepository = reservaRepository;
    }

    @Transactional(readOnly = true)
    public List<Hospede> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Hospede buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Hospede nao encontrado: " + id));
    }

    @Transactional
    public Hospede criar(Hospede hospede) {
        validarDuplicidade(hospede, null);
        hospede.setId(null);
        return repository.save(hospede);
    }

    @Transactional
    public Hospede atualizar(Long id, Hospede dados) {
        Hospede hospede = buscar(id);
        validarDuplicidade(dados, hospede);
        hospede.setNome(dados.getNome());
        hospede.setCpf(dados.getCpf());
        hospede.setEmail(dados.getEmail());
        hospede.setTelefone(dados.getTelefone());
        return repository.save(hospede);
    }

    @Transactional
    public void excluir(Long id) {
        if (!reservaRepository.findByHospedeId(id).isEmpty()) {
            throw new RegraNegocioException("Hospede possui reservas vinculadas");
        }
        repository.delete(buscar(id));
    }

    private void validarDuplicidade(Hospede dados, Hospede atual) {
        boolean cpfAlterado = atual == null || !atual.getCpf().equals(dados.getCpf());
        if (cpfAlterado && repository.existsByCpf(dados.getCpf())) {
            throw new RegraNegocioException("Ja existe um hospede com o CPF informado");
        }

        boolean emailAlterado = atual == null || !atual.getEmail().equalsIgnoreCase(dados.getEmail());
        if (emailAlterado && repository.existsByEmailIgnoreCase(dados.getEmail())) {
            throw new RegraNegocioException("Ja existe um hospede com o e-mail informado");
        }
    }
}
