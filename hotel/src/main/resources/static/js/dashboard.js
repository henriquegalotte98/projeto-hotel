// ============================================================
// DASHBOARD - Página principal
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    verificarAutenticacao();
    carregarDadosUsuario();
    carregarReservasQuandoPermitido();
});

function verificarAutenticacao() {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
        window.location.href = "login.html";
    }
}

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
            const iniciais = usuario.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
            avatarEl.textContent = iniciais;
        }

        // ===== APLICA REGRAS DO MENU (NOVO) =====
        if (typeof aplicarRegrasMenu === "function") {
            aplicarRegrasMenu(usuario.papel);
        }

    } catch (e) {
        console.error("Erro ao interpretar dados do usuário logado:", e);
        fazerLogout();
    }
}

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
