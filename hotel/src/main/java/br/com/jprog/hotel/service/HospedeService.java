package br.com.jprog.hotel.service;
// 🏠 Diz onde este arquivo está guardado.
// É como dizer: "Essa é a casa do HospedeService."

import br.com.jprog.hotel.exception.*;
// 🚨 Importa os tipos de erro que o sistema pode usar.
// Por exemplo: "hóspede não encontrado" ou "CPF já cadastrado".

import br.com.jprog.hotel.model.Hospede;
// 👤 Traz o modelo Hospede.
// É aqui que estão as informações do hóspede,
// como nome, CPF, telefone e e-mail.

import br.com.jprog.hotel.repository.*;
// 🗄️ Traz os Repositories.
// Eles são os responsáveis por conversar com o banco de dados.

import org.springframework.stereotype.Service;
// ⚙️ Diz ao Spring que essa classe é um "Service".
// O Service é onde colocamos as regras do sistema.

import java.util.List;
// 📋 Permite trabalhar com uma lista de hóspedes.


@Service
// 🏷️ Avisa ao Spring:
// "Essa classe é um serviço que deve ser gerenciado por você."

import br.com.jprog.hotel.exception.RecursoNaoEncontradoException;
import br.com.jprog.hotel.exception.RegraNegocioException;
import br.com.jprog.hotel.model.Hospede;
import br.com.jprog.hotel.repository.HospedeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** Aplica as regras de cadastro e manutenção dos hóspedes. */
@Service
public class HospedeService {
// 👨‍💼 Cria o funcionário responsável pelas regras dos hóspedes.

    private final HospedeRepository repository;
    // 🗄️ Guarda o repositório dos hóspedes.
    // Ele será usado para procurar, salvar e apagar hóspedes.

    private final ReservaRepository reservaRepository;
    // 📅 Guarda o repositório das reservas.
    // Precisamos dele para saber se um hóspede possui reservas.

    
    public HospedeService(
            HospedeRepository repository,
            ReservaRepository reservaRepository) {
        // 🚪 Este é o construtor.
        // Quando o Service começa, ele recebe os dois "ajudantes":
        // um para hóspedes e outro para reservas.

        this.repository = repository;
        // 👤 Guarda o ajudante dos hóspedes.

        this.reservaRepository = reservaRepository;
        // 📅 Guarda o ajudante das reservas.
    }


    public List<Hospede> listar() {
        // 📋 Pede uma lista com todos os hóspedes.

        return repository.findAll();
        // 🔎 Vai ao banco e pega todos os hóspedes.
    }


    public Hospede buscar(Long id) {
        // 🔎 Procura um hóspede usando o ID.

        return repository.findById(id)
            // 🔍 Procura no banco pelo ID informado.

            .orElseThrow(() ->
                new RecursoNaoEncontradoException(
                    "Hóspede não encontrado"
                )
            );
            // ❌ Se não encontrar o hóspede,
            // aparece um erro dizendo:
            // "Hóspede não encontrado".
    }


    public Hospede criar(Hospede h) {
        // ➕ Cria um novo hóspede.

        if (repository.existsByCpf(h.getCpf()))
            // 🔎 Primeiro pergunta:
            // "Já existe alguém com esse CPF?"

            throw new RegraNegocioException(
                "CPF de hóspede já cadastrado"
            );
            // ❌ Se já existir, não deixa cadastrar.
            // Isso evita dois hóspedes com o mesmo CPF.

        return repository.save(h);
        // 💾 Se estiver tudo certo,
        // salva o novo hóspede no banco.
    }


    public Hospede atualizar(Long id, Hospede dados) {
        // ✏️ Atualiza as informações de um hóspede.

        Hospede h = buscar(id);
        // 🔎 Primeiro procura o hóspede.
        // Se ele não existir, o método buscar() dará erro.


        if (!h.getCpf().equals(dados.getCpf())
                && repository.existsByCpf(dados.getCpf())) {

            throw new RegraNegocioException(
                "CPF de hóspede já cadastrado"
            );
        }

        // 🪪 Aqui verifica o CPF.
        //
        // Se o hóspede estiver tentando mudar o CPF
        // para um CPF que já pertence a outra pessoa,
        // o sistema não permite.


        h.setNome(dados.getNome());
        // ✏️ Atualiza o nome.

        h.setCpf(dados.getCpf());
        // 🪪 Atualiza o CPF.

        h.setTelefone(dados.getTelefone());
        // 📱 Atualiza o telefone.

        h.setEmail(dados.getEmail());
        // 📧 Atualiza o e-mail.


        return repository.save(h);
        // 💾 Salva as alterações no banco
        // e devolve o hóspede atualizado.
    }


    public void excluir(Long id) {
        // 🗑️ Exclui um hóspede.

        if (!reservaRepository.findByHospedeId(id).isEmpty()) {
            // 🔎 Antes de apagar, pergunta:
            // "Esse hóspede possui alguma reserva?"
            //
            // !isEmpty() significa:
            // "A lista NÃO está vazia."

            throw new RegraNegocioException(
                "Hóspede possui reservas vinculadas"
            );
            // ❌ Se tiver reserva, não deixa apagar.
            //
            // Isso evita apagar um hóspede
            // que ainda está ligado a reservas.
        }


        repository.delete(buscar(id));
        // 🗑️ Se não tiver reservas,
        // procura o hóspede e apaga do banco.
    }

    private final HospedeRepository repository;

    public HospedeService(HospedeRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Hospede> listar() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public Hospede buscar(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Hóspede não encontrado: " + id));
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
        repository.delete(buscar(id));
    }

    private void validarDuplicidade(Hospede dados, Hospede atual) {
        boolean cpfAlterado = atual == null || !atual.getCpf().equals(dados.getCpf());
        if (cpfAlterado && repository.existsByCpf(dados.getCpf())) {
            throw new RegraNegocioException("Já existe um hóspede com o CPF informado");
        }

        boolean emailAlterado = atual == null || !atual.getEmail().equalsIgnoreCase(dados.getEmail());
        if (emailAlterado && repository.existsByEmailIgnoreCase(dados.getEmail())) {
            throw new RegraNegocioException("Já existe um hóspede com o e-mail informado");
        }
    }
}
// 🚪 Fim do HospedeService.


/*
O HospedeService é como o GERENTE do hotel. 🧑‍💼🏨

Ele fica no meio do caminho:

        👤 Usuário
           ↓
     ⚙️ HospedeService
           ↓
      🗄️ Banco de dados


Ele possui 5 tarefas principais:

📋 listar()
→ Mostra todos os hóspedes.

🔎 buscar()
→ Procura um hóspede pelo ID.
→ Se não encontrar, mostra um erro.

➕ criar()
→ Cadastra um hóspede.
→ Antes verifica se o CPF já existe.

✏️ atualizar()
→ Altera os dados do hóspede.
→ Também verifica se o novo CPF já pertence a outra pessoa.

🗑️ excluir()
→ Apaga o hóspede.
→ MAS antes verifica se ele possui reservas.
→ Se tiver reservas, não deixa apagar.

"O HospedeService é o funcionário que aplica as regras
do hotel antes de mandar o banco salvar, alterar ou apagar
os dados dos hóspedes."
*/
