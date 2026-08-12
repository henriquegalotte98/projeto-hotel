// URL da API
const API_URL = "https://6a7a62528c69b3eb4a172df5.mockapi.io/:endpoint";

// Função geral para fazer requisições
async function requisicao(endpoint, opcoes = {}) {

    const resposta = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...opcoes,

            headers: {
                "Content-Type": "application/json",
                ...opcoes.headers
            }
        }
    );

    if (!resposta.ok) {
        throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const texto = await resposta.text();

    return texto ? JSON.parse(texto) : null;
}


// GET - listar quartos
async function buscarQuartos() {
    return requisicao("/quartos");
}


// POST - criar quarto
async function criarQuarto(quarto) {

    return requisicao("/quartos", {
        method: "POST",
        body: JSON.stringify(quarto)
    });
}


// DELETE - excluir quarto
async function excluirQuarto(id) {

    return requisicao(`/quartos/${id}`, {
        method: "DELETE"
    });
}