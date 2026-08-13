package br.com.jprog.hotel.repository;
// 🏠 Diz onde este arquivo está guardado dentro do projeto.
// É como dizer: "Esta é a casa do nosso Repository."

import br.com.jprog.hotel.model.Usuario;
// 👤 Traz o Usuario para podermos trabalhar com ele.

import org.springframework.data.jpa.repository.JpaRepository;
// 🧰 Traz uma "caixa de ferramentas" pronta.
// Ela já sabe salvar, procurar, atualizar e apagar dados no banco.

import java.util.Optional;
// 📦 Cria uma caixinha que pode ter um usuário dentro
// ou pode estar vazia caso nenhum usuário seja encontrado.

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
// 🧑‍💼 Cria o ajudante que cuida dos usuários.
// Usuario = o tipo de informação que vamos guardar.
// Long = o tipo do ID do usuário.
// JpaRepository = dá várias funções prontas para conversar com o banco.

    Optional<Usuario> findByCpf(String cpf);
    // 🔎 Procura um usuário usando o CPF.
    // Se encontrar, coloca o usuário dentro do Optional.
    // Se não encontrar, o Optional fica vazio.

    boolean existsByCpf(String cpf);
    // ❓ Pergunta se já existe um usuário com esse CPF.
    // true  = ✅ existe
    // false = ❌ não existe

}
// 🚪 Fim do nosso UsuarioRepository.

/*O UsuarioRepository é como um funcionário que cuida
de um grande armário cheio de fichas de usuários.

Ele conversa com o banco de dados e pode:

 salvar usuários
 procurar usuários
 atualizar usuários
 apagar usuários

Além disso:

findByCpf()   → procura um usuário pelo CPF.
existsByCpf() → verifica se um CPF já está cadastrado.

"Esse código ajuda o sistema a conversar com o banco
de dados para cuidar dos usuários."
*/
