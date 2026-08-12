// Elementos do HTML

const lista = document.getElementById("lista-quartos");

const formulario = document.getElementById("form-quarto");

const mensagem = document.getElementById("mensagem");

const atualizar = document.getElementById("atualizar");


// Quando a página abrir

document.addEventListener("DOMContentLoaded", carregarQuartos);


// =====================================================
// LISTAR
// =====================================================

async function carregarQuartos() {

    lista.innerHTML = `
        <tr>
            <td colspan="8">
                Carregando...
            </td>
        </tr>
    `;

    try {

        const quartos = await buscarQuartos();

        lista.innerHTML = "";

        quartos.forEach(quarto => {

            const linha = document.createElement("tr");

            linha.innerHTML = `

                <td>${quarto.id}</td>

                <td>${quarto.numero}</td>

                <td>${quarto.tipo}</td>

                <td>
                    R$ ${Number(quarto.valorDiaria)
                    .toFixed(2)
                    .replace(".", ",")}
                </td>

                <td>
                    ${quarto.incluiCafeDaManha ? "Sim" : "Não"}
                </td>

                <td>
                    ${quarto.statusOcupacao || "DISPONIVEL"}
                </td>

                <td>
                    ${quarto.statusLimpeza || "LIMPO"}
                </td>

                <td>

                    <button
                        onclick="deletarQuarto('${quarto.id}')"
                    >
                        Excluir
                    </button>

                </td>

            `;

            lista.appendChild(linha);

        });

    } catch (erro) {

        console.error(erro);

        lista.innerHTML = `
            <tr>
                <td colspan="8">
                    Erro ao carregar quartos.
                </td>
            </tr>
        `;
    }
}


// =====================================================
// CADASTRAR
// =====================================================

formulario.addEventListener("submit", async function (evento) {

    evento.preventDefault();

    const quarto = {

        numero:
            document.getElementById("numero").value,

        tipo:
            document.getElementById("tipo").value,

        valorDiaria:
            Number(
                document.getElementById("valorDiaria").value
            ),

        incluiCafeDaManha:
            document.getElementById(
                "incluiCafeDaManha"
            ).checked,

        statusOcupacao:
            "DISPONIVEL",

        statusLimpeza:
            "LIMPO"

    };


    try {

        await criarQuarto(quarto);

        mensagem.textContent =
            "Quarto cadastrado com sucesso!";

        mensagem.style.color = "green";

        formulario.reset();

        await carregarQuartos();

    } catch (erro) {

        console.error(erro);

        mensagem.textContent =
            "Erro ao cadastrar quarto.";

        mensagem.style.color = "red";

    }

});


// =====================================================
// EXCLUIR
// =====================================================

async function deletarQuarto(id) {

    if (!confirm("Deseja excluir este quarto?")) {
        return;
    }

    try {

        await excluirQuarto(id);

        mensagem.textContent =
            "Quarto excluído com sucesso!";

        mensagem.style.color = "green";

        await carregarQuartos();

    } catch (erro) {

        console.error(erro);

        mensagem.textContent =
            "Erro ao excluir quarto.";

        mensagem.style.color = "red";

    }
}


// =====================================================
// ATUALIZAR
// =====================================================

atualizar.addEventListener(
    "click",
    carregarQuartos
);