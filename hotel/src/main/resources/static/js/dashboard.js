// Painel executivo: usuario, indicadores e reservas recentes.
(function () {
    "use strict";

    let usuarioLogado = null;

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    verificarAutenticacao();
    carregarDadosUsuario();
    carregarReservasQuandoPermitido();
});

// ============================================================
// VERIFICA USUÁRIO LOGADO E APLICA REGRAS
// ============================================================

function verificarUsuario() {
    const usuarioStr = localStorage.getItem("usuarioLogado");
    if (!usuarioStr) {
        window.location.href = "login.html";
        return;
    }

            try {
                return JSON.parse(localStorage.getItem("usuarioLogado") || "null");
            } catch (_) {
                location.href = "login.html";
                return null;
            }
        }
    }

    function preencherUsuario(usuario) {
        const nome = usuario.nome || "Usuário";
        const papel = String(usuario.papel || "").replace(/^ROLE_/, "");
        const nomeEl = document.getElementById("usuario-nome");
        const papelEl = document.getElementById("usuario-papel");
        const avatarEl = document.getElementById("avatar-inicial");

        if (nomeEl) nomeEl.textContent = nome;
        if (papelEl) {
            papelEl.textContent = formatarPapel(papel);
            papelEl.className = `badge ${papel.toLowerCase()}`;
        }
        if (avatarEl) avatarEl.textContent = iniciais(nome);
    }

    function aplicarRegrasAtalhos(papelInformado) {
        const papel = String(papelInformado || "").replace(/^ROLE_/, "");
        document.querySelectorAll(".dashboard-shortcut").forEach(atalho => {
            const permitidos = (atalho.dataset.papeis || "").split(",");
            atalho.hidden = !permitidos.includes(papel);
        });

        const textoQuartos = document.querySelector("#atalho-quartos span");
        if (textoQuartos) {
            textoQuartos.textContent = papel === "ADMIN" ? "Gerenciar Quartos" : "Visualizar Quartos";
        }
    }

    async function carregarIndicadores() {
        const papel = String(usuarioLogado.papel || "").replace(/^ROLE_/, "");

        const quartosPromise = requisicaoSegura("/quartos", []);
        const reservasPromise = ["ADMIN", "RECEPCIONISTA"].includes(papel)
            ? requisicaoSegura("/reservas", []) : Promise.resolve([]);
        const manutencoesPromise = ["ADMIN", "MANUTENCAO"].includes(papel)
            ? requisicaoSegura("/manutencao", []) : Promise.resolve([]);

        const [quartos, reservas, manutencoes] = await Promise.all([
            quartosPromise, reservasPromise, manutencoesPromise
        ]);

        definirTexto("quartos-ocupados", quartos.filter(q => q.statusOcupacao === "OCUPADO").length);
        definirTexto("quartos-disponiveis", quartos.filter(q => q.statusOcupacao === "DISPONIVEL").length);
        definirTexto("checkins-pendentes", reservas.filter(r => r.status === "RESERVADA").length);
        definirTexto("manutencoes", manutencoes.filter(m => !["CONCLUIDA", "CANCELADA"].includes(m.status)).length);
        renderizarReservas(reservas);
    }

    async function requisicaoSegura(endpoint, valorPadrao) {
        try {
            const dados = await apiRequest(endpoint);
            return Array.isArray(dados) ? dados : valorPadrao;
        } catch (erro) {
            console.error(`Erro ao carregar ${endpoint}:`, erro);
            return valorPadrao;
        }
    }

    function renderizarReservas(reservas) {
        const tabela = document.getElementById("ultimas-reservas");
        if (!tabela) return;

        const recentes = [...reservas]
            .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
            .slice(0, 5);

        if (!recentes.length) {
            tabela.innerHTML = '<tr><td colspan="4" class="dashboard-empty">Nenhuma reserva encontrada.</td></tr>';
            return;
        }

        tabela.innerHTML = recentes.map(reserva => `
            <tr>
                <td>${escapar(reserva.hospede?.nome || "-")}</td>
                <td>Quarto ${escapar(reserva.quarto?.numero ?? "-")}</td>
                <td>${formatarData(reserva.dataCheckinPrevista)}</td>
                <td><span class="badge-status status-${String(reserva.status || "").toLowerCase()}">${escapar(reserva.status || "-")}</span></td>
            </tr>
        `).join("");
    }

    function fazerLogout() {
        apiRequest("/auth/logout", "POST").catch(() => {}).finally(() => {
            localStorage.removeItem("usuarioLogado");
            localStorage.removeItem("token");
            location.href = "login.html";
        });
    }

    function definirTexto(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = String(valor);
    }

    function iniciais(nome) {
        return nome.trim().split(/\s+/).slice(0, 2).map(parte => parte[0]).join("").toUpperCase() || "HW";
    }

    function formatarPapel(papel) {
        return ({ ADMIN: "Administrador", RECEPCIONISTA: "Recepcionista", GOVERNANCA: "Governança", MANUTENCAO: "Manutenção" })[papel] || papel;
    }

    function formatarData(data) {
        if (!data) return "-";
        const [ano, mes, dia] = data.split("-");
        return dia && mes && ano ? `${dia}/${mes}/${ano}` : escapar(data);
    }
}

// ============================================================
// CANCELAR EDIÇÃO
// ============================================================

function cancelarEdicao() {
    document.getElementById("formQuarto").reset();
    document.getElementById("quartoId").value = "";
    document.getElementById("tituloFormulario").textContent = "Cadastrar quarto";
    document.getElementById("btnCancelar").classList.add("hidden");
}

// ============================================================
// CONFIGURAR EVENTOS
// ============================================================

function configurarEventos() {
    document.getElementById("filtroStatus")?.addEventListener("change", renderizarQuartos);
    document.getElementById("filtroTipo")?.addEventListener("change", renderizarQuartos);
    document.getElementById("pesquisa")?.addEventListener("input", renderizarQuartos);
    document.getElementById("btnLogout")?.addEventListener("click", fazerLogout);
    document.getElementById("formQuarto")?.addEventListener("submit", salvarQuarto);
    document.getElementById("btnCancelar")?.addEventListener("click", cancelarEdicao);
}

// ============================================================
// LOGOUT
// ============================================================

function fazerLogout() {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

window.tratarErroAPI = function(status) {
    if (status === 401) {
        alert("Sua sessão expirou ou você não está autenticado.");
        fazerLogout();
    } else if (status === 403) {
        alert("Acesso Negado: Você não tem permissão para acessar este recurso.");
        window.location.href = "dashboard.html";
    }
};

function carregarReservasQuandoPermitido() {
    const lista = document.getElementById('lista-reservas');
    if (!lista) return;

    try {
        const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (usuario.papel === 'ADMIN' || usuario.papel === 'RECEPCIONISTA') {
            carregarReservas();
        } else {
            mostrarEstadoReservas('As reservas estão disponíveis apenas para administradores e recepcionistas.');
        }
    } catch (_error) {
        mostrarEstadoReservas('Não foi possível identificar o usuário logado.');
    }
}

async function carregarReservas() {
    mostrarEstadoReservas('Carregando reservas...', true);

    try {
        const reservas = await apiRequest('/reservas', 'GET');
        renderizarReservas(Array.isArray(reservas) ? reservas : []);
    } catch (error) {
        mostrarEstadoReservas(mensagemErroOperacao(error, 'Não foi possível carregar as reservas.'));
    }
}

function renderizarReservas(reservas) {
    const tbody = document.getElementById('lista-reservas');
    if (!tbody) return;

    tbody.replaceChildren();
    if (reservas.length === 0) {
        mostrarEstadoReservas('Nenhuma reserva encontrada.');
        return;
    }

    reservas.forEach((reserva) => {
        const linha = document.createElement('tr');
        adicionarCelula(linha, reserva.hospede?.nome || '-');
        adicionarCelula(linha, descricaoQuarto(reserva.quarto));
        adicionarCelula(linha, formatarDataReserva(reserva.dataCheckinPrevista));

        const statusCelula = document.createElement('td');
        const status = document.createElement('span');
        status.className = `badge-status ${reserva.status === 'RESERVADA' ? 'disponivel' : 'ocupado'}`;
        status.textContent = reserva.status || '-';
        statusCelula.appendChild(status);
        linha.appendChild(statusCelula);

        const acoesCelula = document.createElement('td');
        const acoes = document.createElement('div');
        acoes.className = 'reservation-actions';
        if (reserva.status === 'RESERVADA') {
            acoes.appendChild(criarBotaoOperacao('Check-in', 'checkin', reserva.id));
        } else if (reserva.status === 'CHECKIN') {
            acoes.appendChild(criarBotaoOperacao('Check-out', 'checkout', reserva.id));
        } else {
            acoes.textContent = '-';
        }
        acoesCelula.appendChild(acoes);
        linha.appendChild(acoesCelula);
        tbody.appendChild(linha);
    });
}

function adicionarCelula(linha, valor) {
    const celula = document.createElement('td');
    celula.textContent = valor;
    linha.appendChild(celula);
}

function descricaoQuarto(quarto) {
    if (!quarto) return '-';
    return quarto.numero ? `Quarto ${quarto.numero}` : `Quarto ${quarto.id || '-'}`;
}

function formatarDataReserva(data) {
    if (!data) return '-';
    const partes = data.split('-');
    return partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : data;
}

function criarBotaoOperacao(rotulo, operacao, reservaId) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = `reservation-action ${operacao}`;
    botao.textContent = rotulo;
    botao.addEventListener('click', () => executarOperacaoReserva(botao, operacao, reservaId));
    return botao;
}

async function executarOperacaoReserva(botao, operacao, reservaId) {
    const nomeOperacao = operacao === 'checkin' ? 'check-in' : 'check-out';
    if (!confirm(`Confirmar ${nomeOperacao} da reserva ${reservaId}?`)) return;

    botao.disabled = true;
    const textoOriginal = botao.textContent;
    botao.textContent = 'Processando...';

    try {
        await apiRequest(`/reservas/${reservaId}/${operacao}`, 'POST');
        mostrarMensagemOperacao(`${nomeOperacao === 'check-in' ? 'Check-in' : 'Check-out'} realizado com sucesso.`, 'success');
        await carregarReservas();
    } catch (error) {
        mostrarMensagemOperacao(mensagemErroOperacao(error, `Não foi possível realizar o ${nomeOperacao}.`), 'error');
        botao.disabled = false;
        botao.textContent = textoOriginal;
    }
}

function mensagemErroOperacao(error, mensagemPadrao) {
    if (error?.status === 401) return 'Sua sessão expirou. Faça login novamente.';
    if (error?.status === 403) return 'Você não tem permissão para realizar esta operação.';
    if (error?.status === 404) return error.data?.erro || 'Reserva não encontrada.';
    return error?.data?.erro || (typeof error?.message === 'string' ? error.message : mensagemPadrao) || mensagemPadrao;
}

function mostrarMensagemOperacao(mensagem, tipo) {
    const elemento = document.getElementById('mensagem-operacao');
    if (!elemento) return;
    elemento.textContent = mensagem;
    elemento.className = `operation-message visible ${tipo}`;
}

function mostrarEstadoReservas(mensagem, carregando = false) {
    const tbody = document.getElementById('lista-reservas');
    if (!tbody) return;

    const linha = document.createElement('tr');
    const celula = document.createElement('td');
    celula.colSpan = 5;
    celula.className = 'reservation-state';
    if (carregando) {
        const icone = document.createElement('i');
        icone.className = 'fa-solid fa-spinner fa-spin';
        celula.append(icone, document.createTextNode(` ${mensagem}`));
    } else {
        celula.textContent = mensagem;
    }
    linha.appendChild(celula);
    tbody.replaceChildren(linha);
}
