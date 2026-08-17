package br.com.jprog.hotel.service;

import br.com.jprog.hotel.exception.RecursoNaoEncontradoException;
import br.com.jprog.hotel.exception.RegraNegocioException;
import br.com.jprog.hotel.model.Hospede;
import br.com.jprog.hotel.repository.HospedeRepository;
import br.com.jprog.hotel.repository.ReservaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HospedeService {
    private final HospedeRepository repository;
    private final ReservaRepository reservaRepository;

    public HospedeService(HospedeRepository repository, ReservaRepository reservaRepository) {
        this.repository = repository; this.reservaRepository = reservaRepository;
    }

    @Transactional(readOnly = true)
    public List<Hospede> listar() { return repository.findAll(); }

    @Transactional(readOnly = true)
    public Hospede buscar(String cpf) {
        return repository.findById(cpf)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Hóspede não encontrado: " + cpf));
    }

    @Transactional
    public Hospede criar(Hospede hospede) {
        if (repository.existsById(hospede.getCpf()))
            throw new RegraNegocioException("Já existe um hóspede com o CPF informado");
        return repository.save(hospede);
    }

    @Transactional
    public Hospede atualizar(String cpf, Hospede dados) {
        Hospede hospede = buscar(cpf);
        hospede.setNome(dados.getNome());
        hospede.setTelefone(dados.getTelefone());
        return repository.save(hospede);
    }

    @Transactional
    public void excluir(String cpf) {
        if (!reservaRepository.findByHospedeCpf(cpf).isEmpty())
            throw new RegraNegocioException("Hóspede possui reservas vinculadas");
        repository.delete(buscar(cpf));
    }
}
