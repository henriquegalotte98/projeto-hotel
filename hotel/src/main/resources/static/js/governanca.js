// ============================================================
// GOVERNANÇA - Controle da limpeza dos quartos
// ============================================================

// Inicializa a página
document.addEventListener("DOMContentLoaded", () => {
    verificarAutenticacao();
    carregarDadosUsuario();
    carregarQuartos();
    configurarEventos();
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
    if (!usuarioStr) return;

    try {
        const usuario = JSON.parse(usuarioStr);
        const nomeEl = document.getElementById("usuario-nome");
        const papelEl = document.getElementById("usuario-papel");
        const avatarEl = document.getElementById("avatar-inicial");

        if (nomeEl) nomeEl.textContent = usuario.nome || "Colaborador";

        if (papelEl) {
            const papel = usuario.papel || "FUNCIONARIO";
            papelEl.textContent = papel;
            papelEl.className = `badge ${papel.toLowerCase()}`;
        }

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

        if (typeof aplicarRegrasMenu === "function") {
            aplicarRegrasMenu(usuario.papel);
        }

    } catch (erro) {
        console.error("Erro ao carregar usuário:", erro);
        fazerLogout();
    }
}

// ============================================================
// CONFIGURAR EVENTOS
// ============================================================

function configurarEventos() {
    const btnFiltrar = document.getElementById("btnFiltrar");
    if (btnFiltrar) {
        btnFiltrar.addEventListener("click", () => {
            aplicarFiltros();
        });
    }

    const btnLimpar = document.getElementById("btnLimparFiltro");
    if (btnLimpar) {
        btnLimpar.addEventListener("click", () => {
            document.getElementById("filtro-status").value = "";
            document.getElementById("filtro-quarto").value = "";
            aplicarFiltros();
        });
    }

    const btnAtualizar = document.getElementById("btnAtualizar");
    if (btnAtualizar) {
        btnAtualizar.addEventListener("click", () => {
            carregarQuartos();
            mostrarToast("info", "Atualizado!", "Lista de quartos recarregada.");
        });
    }
}

// ============================================================
// CARREGAR QUARTOS
// ============================================================

async function carregarQuartos() {
    const tabela = document.getElementById("lista-quartos");
    if (!tabela) {
        console.error("Elemento #lista-quartos não encontrado.");
        return;
    }

    tabela.innerHTML = `
        <tr>
            <td colspan="5" class="loading-message">
                <i class="fa-solid fa-spinner fa-spin"></i> Carregando quartos...
            </td>
        </tr>
    `;

    try {
        const quartos = await apiRequest("/governanca/quartos", "GET");
        console.log("Quartos recebidos:", quartos);

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

        window.quartosData = quartos;
        aplicarFiltros();

    } catch (erro) {
        console.error("Erro ao carregar quartos:", erro);
        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="loading-message" style="color: var(--danger);">
                    <i class="fa-solid fa-circle-exclamation"></i> Erro ao carregar os quartos.
                </td>
            </tr>
        `;
        tratarErroAPI(erro.status);
    }
}

// ============================================================
// APLICAR FILTROS
// ============================================================

function aplicarFiltros() {
    const quartos = window.quartosData || [];
    const statusFiltro = document.getElementById("filtro-status")?.value || "";
    const quartoFiltro = document.getElementById("filtro-quarto")?.value.trim().toLowerCase() || "";

    const quartosFiltrados = quartos.filter(quarto => {
        const status = quarto.statusLimpeza || "";
        const numero = String(quarto.numero || "").toLowerCase();

        const correspondeStatus = statusFiltro === "" || status === statusFiltro;
        const correspondeQuarto = quartoFiltro === "" || numero.includes(quartoFiltro);

        return correspondeStatus && correspondeQuarto;
    });

    renderizarTabela(quartosFiltrados);
    atualizarResumo(quartos);
}

// ============================================================
// RENDERIZAR TABELA
// ============================================================

function renderizarTabela(quartos) {
    const tabela = document.getElementById("lista-quartos");
    if (!tabela) return;

    if (!quartos || quartos.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="loading-message">
                    Nenhum quarto encontrado.
                </td>
            </tr>
        `;
        return;
    }

    tabela.innerHTML = "";
    quartos.forEach(quarto => {
        const linha = criarLinhaQuarto(quarto);
        tabela.appendChild(linha);
    });
}

// ============================================================
// CRIAR LINHA DA TABELA
// ============================================================

function criarLinhaQuarto(quarto) {
    const tr = document.createElement("tr");

    const id = quarto.id ?? "-";
    const numero = quarto.numero ?? "-";
    const tipo = quarto.tipo ?? "-";

    const statusOcupacao = quarto.statusOcupacao ?? quarto.status_ocupacao ?? "-";
    const statusLimpeza = quarto.statusLimpeza ?? quarto.status_limpeza ?? "LIMPO";

    tr.innerHTML = `
        <td><strong>${numero}</strong></td>
        <td>${formatarTipoQuarto(tipo)}</td>
        <td>
            <span class="badge-status ${classeStatusOcupacao(statusOcupacao)}">
                ${formatarStatus(statusOcupacao)}
            </span>
        </td>
        <td>
            <span class="badge-status ${classeStatusLimpeza(statusLimpeza)}" id="status-${id}">
                ${formatarStatus(statusLimpeza)}
            </span>
        </td>
        <td style="text-align: center;">
            <select class="select-limpeza" data-quarto-id="${id}" data-status-atual="${statusLimpeza}">
                <option value="SUJO" ${statusLimpeza === "SUJO" ? "selected" : ""}>Sujo</option>
                <option value="EM_LIMPEZA" ${statusLimpeza === "EM_LIMPEZA" ? "selected" : ""}>Em limpeza</option>
                <option value="LIMPO" ${statusLimpeza === "LIMPO" ? "selected" : ""}>Limpo</option>
                <option value="INSPECIONADO" ${statusLimpeza === "INSPECIONADO" ? "selected" : ""}>Inspecionado</option>
            </select>
            <button type="button" class="btn-atualizar" onclick="alterarLimpeza(${id}, this)">
                <i class="fa-solid fa-check"></i> Atualizar
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
    if (!linha) return;

    const select = linha.querySelector(".select-limpeza");
    if (!select) return;

    const status = select.value;

    botao.disabled = true;
    const textoOriginal = botao.innerHTML;
    botao.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Atualizando...`;

    try {
        await apiRequest(
            `/governanca/quartos/${id}/limpeza?status=${encodeURIComponent(status)}`,
            "PATCH"
        );

        const cores = {
            "SUJO": { icon: "fa-solid fa-broom", cor: "warning", titulo: "Sujo" },
            "EM_LIMPEZA": { icon: "fa-solid fa-person-broom", cor: "primary", titulo: "Em Limpeza" },
            "LIMPO": { icon: "fa-solid fa-circle-check", cor: "success", titulo: "Limpo" },
            "INSPECIONADO": { icon: "fa-solid fa-clipboard-check", cor: "info", titulo: "Inspecionado" }
        };

        const info = cores[status] || cores["LIMPO"];
        mostrarToast(info.cor, `${info.titulo}!`, `Quarto #${id} está agora ${info.titulo.toLowerCase()}.`);

        await carregarQuartos();

    } catch (erro) {
        console.error("Erro ao atualizar limpeza:", erro);

        let mensagem = "Erro ao atualizar o status de limpeza.";
        if (erro.status === 400) mensagem = "Status de limpeza inválido.";
        else if (erro.status === 401) mensagem = "Sua sessão expirou. Faça login novamente.";
        else if (erro.status === 403) mensagem = "Você não possui permissão para alterar a limpeza.";
        else if (erro.status === 404) mensagem = "Quarto não encontrado.";
        else if (erro.message) mensagem = erro.message;

        mostrarToast("danger", "Erro!", mensagem);

    } finally {
        botao.disabled = false;
        botao.innerHTML = textoOriginal;
    }
}

// ============================================================
// TOAST DE NOTIFICAÇÃO (COM COR)
// ============================================================

function mostrarToast(tipo, titulo, mensagem) {
    const toast = document.getElementById("toast-notificacao");
    const toastIcon = document.getElementById("toastIcon");
    const toastTitulo = document.getElementById("toastTitulo");
    const toastMensagem = document.getElementById("toastMensagem");

    toast.className = "toast";

    const config = {
        success: { icon: "fa-solid fa-circle-check", cor: "#059669" },
        warning: { icon: "fa-solid fa-triangle-exclamation", cor: "#d97706" },
        danger: { icon: "fa-solid fa-circle-xmark", cor: "#dc2626" },
        info: { icon: "fa-solid fa-circle-info", cor: "#2563eb" },
        primary: { icon: "fa-solid fa-circle-info", cor: "#b45309" }
    };

    const cfg = config[tipo] || config.info;

    toastIcon.style.background = cfg.cor;
    toastIcon.innerHTML = `<i class="${cfg.icon}"></i>`;

    toastTitulo.textContent = titulo;
    toastMensagem.textContent = mensagem;

    toast.classList.add("show");

    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(() => {
        fecharToast();
    }, 4000);
}

function fecharToast() {
    const toast = document.getElementById("toast-notificacao");
    toast.classList.remove("show");
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
        "SIMPLES": "Simples",
        "DUPLO": "Duplo",
        "SUITE": "Suíte",
        "STANDARD": "Standard",
        "LUXO": "Luxo",
        "PRESIDENCIAL": "Presidencial"
    };
    return nomes[tipo] || tipo;
}

function classeStatusLimpeza(status) {
    const classes = {
        "SUJO": "status-sujo",
        "EM_LIMPEZA": "status-em-limpeza",
        "LIMPO": "status-limpo",
        "INSPECIONADO": "status-inspecionado"
    };
    return classes[status] || "";
}

function classeStatusOcupacao(status) {
    const classes = {
        "OCUPADO": "status-ocupado",
        "DISPONIVEL": "status-disponivel",
        "RESERVADO": "status-reservado",
        "BLOQUEADO": "status-bloqueado"
    };
    return classes[status] || "";
}

// ============================================================
// RESUMO DA GOVERNANÇA
// ============================================================

function atualizarResumo(quartos) {
    const total = quartos.length;
    const sujos = quartos.filter(q => obterStatusLimpeza(q) === "SUJO").length;
    const emLimpeza = quartos.filter(q => obterStatusLimpeza(q) === "EM_LIMPEZA").length;
    const limpos = quartos.filter(q => obterStatusLimpeza(q) === "LIMPO").length;
    const inspecionados = quartos.filter(q => obterStatusLimpeza(q) === "INSPECIONADO").length;

    const elementos = {
        "total-quartos": total,
        "quartos-sujos": sujos,
        "quartos-em-limpeza": emLimpeza,
        "quartos-limpos": limpos,
        "quartos-inspecionados": inspecionados
    };

    Object.keys(elementos).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = elementos[id];
    });
}

function obterStatusLimpeza(quarto) {
    return quarto.statusLimpeza ?? quarto.status_limpeza ?? "";
}

// ============================================================
// TRATAMENTO DE ERROS DA API (ATUALIZADO)
// ============================================================

function tratarErroAPI(status) {
    if (status === 401) {
        alert("Sua sessão expirou ou você não está autenticado.");
        fazerLogout();
    } else if (status === 403) {
        alert("Acesso negado. Você não possui permissão para acessar a Governança.");
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
window.mostrarToast = mostrarToast;
window.fecharToast = fecharToast;
window.fazerLogout = fazerLogout;