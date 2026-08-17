// ============================================================
// GOVERNANÇA - Controle da limpeza dos quartos
// ============================================================

// Inicializa a página
document.addEventListener("DOMContentLoaded", () => {
    verificarAutenticacao();
    carregarDadosUsuario();
    carregarQuartos();
});


// ============================================================
// AUTENTICAÇÃO
// ============================================================

function verificarAutenticacao() {

    const usuarioLogado = localStorage.getItem("usuarioLogado");

    if (!usuarioLogado) {
        window.location.href = "login.html";
        return false;
    }

    return true;
}


// ============================================================
// DADOS DO USUÁRIO LOGADO
// ============================================================

function carregarDadosUsuario() {

    const usuarioStr = localStorage.getItem("usuarioLogado");

    if (!usuarioStr) {
        return;
    }

    try {

        const usuario = JSON.parse(usuarioStr);

        const nomeEl = document.getElementById("usuario-nome");
        const papelEl = document.getElementById("usuario-papel");
        const avatarEl = document.getElementById("avatar-inicial");

        // Nome
        if (nomeEl) {
            nomeEl.textContent = usuario.nome || "Colaborador";
        }

        // Papel
        if (papelEl) {

            const papel = usuario.papel || "FUNCIONARIO";

            papelEl.textContent = papel;

            papelEl.className =
                `badge ${papel.toLowerCase()}`;
        }

        // Avatar
        if (avatarEl && usuario.nome) {

            const iniciais = usuario.nome
                .split(" ")
                .filter(nome => nome.length > 0)
                .map(nome => nome[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

            avatarEl.textContent = iniciais;
        }

        // Aplica regras do menu
        if (typeof aplicarRegrasMenu === "function") {
            aplicarRegrasMenu(usuario.papel);
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );

        fazerLogout();
    }
}


// ============================================================
// CARREGAR QUARTOS
// ============================================================

async function carregarQuartos() {

    const tabela = document.getElementById("lista-quartos");

    if (!tabela) {
        console.error(
            "Elemento #lista-quartos não encontrado."
        );
        return;
    }

    // Mostra carregamento
    tabela.innerHTML = `
        <tr>
            <td colspan="5" class="loading-message">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Carregando quartos...
            </td>
        </tr>
    `;

    try {

        // GET /api/governanca/quartos
        const quartos = await apiRequest(
            "/governanca/quartos",
            "GET"
        );

        console.log(
            "Quartos recebidos:",
            quartos
        );

        if (!Array.isArray(quartos) || quartos.length === 0) {

            tabela.innerHTML = `
                <tr>
                    <td colspan="5" class="loading-message">
                        Nenhum quarto encontrado.
                    </td>
                </tr>
            `;

            atualizarResumo([]);
            return;
        }

        // Monta a tabela
        tabela.innerHTML = "";

        quartos.forEach(quarto => {

            const linha = criarLinhaQuarto(quarto);

            tabela.appendChild(linha);
        });

        // Atualiza os indicadores
        atualizarResumo(quartos);

    } catch (erro) {

        console.error(
            "Erro ao carregar quartos:",
            erro
        );

        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="loading-message">
                    <i class="fa-solid fa-circle-exclamation"></i>
                    Erro ao carregar os quartos.
                </td>
            </tr>
        `;

        tratarErroAPI(erro.status);
    }
}


// ============================================================
// CRIAR LINHA DA TABELA
// ============================================================

function criarLinhaQuarto(quarto) {

    const tr = document.createElement("tr");

    const id = quarto.id ?? "-";
    const numero = quarto.numero ?? "-";
    const tipo = quarto.tipo ?? "-";

    const statusOcupacao =
        quarto.statusOcupacao ??
        quarto.status_ocupacao ??
        "-";

    const statusLimpeza =
        quarto.statusLimpeza ??
        quarto.status_limpeza ??
        "LIMPO";

    tr.innerHTML = `
        <td>
            <strong>${numero}</strong>
        </td>

        <td>
            ${formatarTipoQuarto(tipo)}
        </td>

        <td>
            <span class="badge-status ${classeStatusOcupacao(statusOcupacao)}">
                ${formatarStatus(statusOcupacao)}
            </span>
        </td>

        <td>
            <span class="badge-status ${classeStatusLimpeza(statusLimpeza)}">
                ${formatarStatus(statusLimpeza)}
            </span>
        </td>

        <td>
            <select
                class="select-limpeza"
                data-quarto-id="${id}"
                data-status-atual="${statusLimpeza}"
            >
                <option value="SUJO"
                    ${statusLimpeza === "SUJO" ? "selected" : ""}>
                    Sujo
                </option>

                <option value="EM_LIMPEZA"
                    ${statusLimpeza === "EM_LIMPEZA" ? "selected" : ""}>
                    Em limpeza
                </option>

                <option value="LIMPO"
                    ${statusLimpeza === "LIMPO" ? "selected" : ""}>
                    Limpo
                </option>

                <option value="INSPECIONADO"
                    ${statusLimpeza === "INSPECIONADO" ? "selected" : ""}>
                    Inspecionado
                </option>
            </select>

            <button
                type="button"
                class="btn-atualizar"
                onclick="alterarLimpeza(${id}, this)"
            >
                <i class="fa-solid fa-check"></i>
                Atualizar
            </button>
        </td>
    `;

    return tr;
}


// ============================================================
// ALTERAR STATUS DE LIMPEZA
// ============================================================

async function alterarLimpeza(id, botao) {

    const linha = botao.closest("tr");

    if (!linha) {
        return;
    }

    const select = linha.querySelector(".select-limpeza");

    if (!select) {
        return;
    }

    const status = select.value;

    // Desabilita durante a requisição
    botao.disabled = true;

    const textoOriginal = botao.innerHTML;

    botao.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Atualizando...
    `;

    try {

        // PATCH
        //
        // /api/governanca/quartos/{id}/limpeza
        // ?status=EM_LIMPEZA
        await apiRequest(
            `/governanca/quartos/${id}/limpeza?status=${encodeURIComponent(status)}`,
            "PATCH"
        );

        mostrarMensagem(
            "Status de limpeza atualizado com sucesso!",
            "success"
        );

        // Recarrega a lista para garantir
        // que a tela esteja igual ao banco.
        await carregarQuartos();

    } catch (erro) {

        console.error(
            "Erro ao atualizar limpeza:",
            erro
        );

        let mensagem =
            "Erro ao atualizar o status de limpeza.";

        if (erro.status === 400) {
            mensagem =
                "Status de limpeza inválido.";
        } else if (erro.status === 401) {
            mensagem =
                "Sua sessão expirou. Faça login novamente.";
        } else if (erro.status === 403) {
            mensagem =
                "Você não possui permissão para alterar a limpeza.";
        } else if (erro.status === 404) {
            mensagem =
                "Quarto não encontrado.";
        } else if (erro.message) {
            mensagem = erro.message;
        }

        mostrarMensagem(
            mensagem,
            "error"
        );

    } finally {

        botao.disabled = false;
        botao.innerHTML = textoOriginal;
    }
}


// ============================================================
// FORMATAÇÕES
// ============================================================

function formatarStatus(status) {

    const nomes = {

        "SUJO": "Sujo",

        "EM_LIMPEZA": "Em limpeza",

        "LIMPO": "Limpo",

        "INSPECIONADO": "Inspecionado",

        "DISPONIVEL": "Disponível",

        "OCUPADO": "Ocupado",

        "RESERVADO": "Reservado",

        "BLOQUEADO": "Bloqueado"
    };

    return nomes[status] || status;
}


function formatarTipoQuarto(tipo) {

    const nomes = {

        "STANDARD": "Standard",

        "LUXO": "Luxo",

        "SUITE": "Suíte",

        "PRESIDENCIAL": "Presidencial"
    };

    return nomes[tipo] || tipo;
}


function classeStatusLimpeza(status) {

    switch (status) {

        case "SUJO":
            return "status-sujo";

        case "EM_LIMPEZA":
            return "status-limpeza";

        case "LIMPO":
            return "status-limpo";

        case "INSPECIONADO":
            return "status-inspecionado";

        default:
            return "";
    }
}


function classeStatusOcupacao(status) {

    switch (status) {

        case "OCUPADO":
            return "status-ocupado";

        case "DISPONIVEL":
            return "status-disponivel";

        case "RESERVADO":
            return "status-reservado";

        case "BLOQUEADO":
            return "status-bloqueado";

        default:
            return "";
    }
}


// ============================================================
// RESUMO DA GOVERNANÇA
// ============================================================

function atualizarResumo(quartos) {

    const total = quartos.length;

    const sujos = quartos.filter(
        quarto =>
            obterStatusLimpeza(quarto) === "SUJO"
    ).length;

    const emLimpeza = quartos.filter(
        quarto =>
            obterStatusLimpeza(quarto) === "EM_LIMPEZA"
    ).length;

    const limpos = quartos.filter(
        quarto =>
            obterStatusLimpeza(quarto) === "LIMPO"
    ).length;

    const inspecionados = quartos.filter(
        quarto =>
            obterStatusLimpeza(quarto) === "INSPECIONADO"
    ).length;

    const elementoTotal =
        document.getElementById("total-quartos");

    const elementoSujos =
        document.getElementById("quartos-sujos");

    const elementoLimpeza =
        document.getElementById("quartos-em-limpeza");

    const elementoLimpos =
        document.getElementById("quartos-limpos");

    const elementoInspecionados =
        document.getElementById("quartos-inspecionados");

    if (elementoTotal) {
        elementoTotal.textContent = total;
    }

    if (elementoSujos) {
        elementoSujos.textContent = sujos;
    }

    if (elementoLimpeza) {
        elementoLimpeza.textContent = emLimpeza;
    }

    if (elementoLimpos) {
        elementoLimpos.textContent = limpos;
    }

    if (elementoInspecionados) {
        elementoInspecionados.textContent = inspecionados;
    }
}


function obterStatusLimpeza(quarto) {

    return (
        quarto.statusLimpeza ??
        quarto.status_limpeza ??
        ""
    );
}


// ============================================================
// MENSAGENS
// ============================================================

function mostrarMensagem(mensagem, tipo = "success") {

    let elemento =
        document.getElementById("mensagem-governanca");

    // Se o HTML ainda não tiver o elemento,
    // cria automaticamente.
    if (!elemento) {

        elemento = document.createElement("div");

        elemento.id = "mensagem-governanca";

        document.body.appendChild(elemento);
    }

    elemento.className =
        `alert alert-${tipo}`;

    elemento.textContent = mensagem;

    elemento.style.display = "block";

    setTimeout(() => {

        elemento.style.display = "none";

    }, 4000);
}


// ============================================================
// TRATAMENTO DE ERROS DA API
// ============================================================

function tratarErroAPI(status) {

    if (status === 401) {

        alert(
            "Sua sessão expirou ou você não está autenticado."
        );

        fazerLogout();

    } else if (status === 403) {

        alert(
            "Acesso negado. Você não possui permissão para acessar a Governança."
        );

        window.location.href = "dashboard.html";
    }
}


// ============================================================
// LOGOUT
// ============================================================

function fazerLogout() {

    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("token");

    window.location.href = "login.html";
}


// ============================================================
// EXPORTAÇÕES
// ============================================================

window.carregarQuartos = carregarQuartos;
window.alterarLimpeza = alterarLimpeza;
window.mostrarMensagem = mostrarMensagem;
window.fazerLogout = fazerLogout;