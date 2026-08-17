/* =========================================
   CONFIGURAÇÃO DA API
========================================= */

/*
    Quando o Spring Boot estiver rodando,
    altere esta URL caso necessário.

    Exemplo:

    http://localhost:8080
*/

const API_BASE_URL = "http://localhost:8080/api";


/* =========================================
   FUNÇÃO PRINCIPAL DA API
========================================= */

async function apiRequest(
    endpoint,
    options = {}
) {

    const resposta = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,

            headers: {

                "Content-Type":
                    "application/json",

                ...(options.headers || {})

            },

            credentials: "include"

        }
    );


    /*
        Caso a resposta seja erro HTTP
    */

    if (!resposta.ok) {

        let mensagem =
            "Erro ao comunicar com o servidor.";

        try {

            const erro =
                await resposta.json();

            mensagem =
                erro.message ||
                erro.mensagem ||
                mensagem;

        } catch {

            // Mantém mensagem padrão

        }

        throw new Error(mensagem);

    }


    /*
        Alguns endpoints podem
        não retornar conteúdo.
    */

    if (
        resposta.status === 204
    ) {

        return null;

    }


    return resposta.json();

}