// ============================================================
// QUARTOS - Gerenciamento dos quartos
// ============================================================

let quartos = [];
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
        usuarioLogado = JSON.parse(usuarioStr);
        const nome = document.getElementById("usuarioNome");
        if (nome) {
            nome.textContent = usuarioLogado.nome || "Usuário";
        }

        // ============================================================
        // REGRA DE NEGÓCIO: SÓ ADMIN PODE CRIAR/EDITAR/EXCLUIR
        // ============================================================

        // 1. Esconde o formulário de cadastro se NÃO for ADMIN
        const formSection = document.querySelector(".content-card:first-of-type"); // Pega o card do formulário
        if (formSection && usuarioLogado.papel !== 'ADMIN') {
            formSection.style.display = 'none';
        }

        // 2. Esconde a coluna de "Ações" na tabela se NÃO for ADMIN
        const thAcoes = document.querySelector("thead th:last-child");
        if (thAcoes && usuarioLogado.papel !== 'ADMIN') {
            thAcoes.style.display = 'none';
        }

    } catch (erro) {
        console.error("Erro ao carregar usuário:", erro);
        localStorage.removeItem("usuarioLogado");
        window.location.href = "login.html";
    }
}

// ============================================================
// CARREGAR QUARTOS (GET /api/quartos)
// ============================================================

async function carregarQuartos() {
    const tabela = document.getElementById("tabelaQuartos");
    if (tabela) {
        tabela.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    <i class="fa-solid fa-spinner fa-spin"></i> Carregando quartos...
                </td>
            </tr>
        `;
    }

    try {
        quartos = await apiRequest("/quartos", "GET");

        if (!Array.isArray(quartos)) {
            quartos = [];
        }

        atualizarResumo();
        renderizarQuartos();

    } catch (erro) {
        console.error("Erro ao carregar quartos:", erro);
        if (tabela) {
            tabela.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center; color: var(--danger);">
                        <i class="fa-solid fa-circle-exclamation"></i> Erro: ${erro.message || 'Tente novamente'}
                    </td>
                </tr>
            `;
        }
        console.error("Não foi possível carregar os quartos.", "erro");
    }
}

// ============================================================
// RENDERIZAR TABELA
// ============================================================

function renderizarQuartos() {
    const tabela = document.getElementById("tabelaQuartos");
    if (!tabela) return;

    const statusFiltro = document.getElementById("filtroStatus")?.value || "TODOS";
    const tipoFiltro = document.getElementById("filtroTipo")?.value || "TODOS";
    const pesquisa = document.getElementById("pesquisa")?.value.trim().toLowerCase() || "";

    const quartosFiltrados = quartos.filter(quarto => {
        const status = quarto.statusOcupacao || "";
        const tipo = quarto.tipo || "";
        const numero = String(quarto.numero || "").toLowerCase();

        const correspondeStatus = statusFiltro === "TODOS" || status === statusFiltro;
        const correspondeTipo = tipoFiltro === "TODOS" || tipo === tipoFiltro;
        const correspondePesquisa = numero.includes(pesquisa);

        return correspondeStatus && correspondeTipo && correspondePesquisa;
    });

    if (quartosFiltrados.length === 0) {
        tabela.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">
                    Nenhum quarto encontrado.
                </td>
            </tr>
        `;
        return;
    }

    tabela.innerHTML = "";
    
    quartosFiltrados.forEach(quarto => {
        const tr = document.createElement("tr");
        
        // Só mostra a coluna de ações se for ADMIN
        let colunaAcoes = '';
        if (usuarioLogado && usuarioLogado.papel === 'ADMIN') {
            colunaAcoes = `
                <td>
                    <button type="button" class="btn btn-secondary" onclick="editarQuarto(${quarto.id})">
                        <i class="fa-solid fa-pen"></i> Editar
                    </button>
                    <button type="button" class="btn btn-danger" onclick="excluirQuarto(${quarto.id})">
                        <i class="fa-solid fa-trash"></i> Excluir
                    </button>
                </td>
            `;
        } else {
            // Se não for ADMIN, coloca um espaço vazio ou "---"
            colunaAcoes = `<td style="text-align:center; color:#94a3b8;">---</td>`;
        }

        tr.innerHTML = `
            <td><strong>${quarto.numero ?? "-"}</strong></td>
            <td>${formatarTipo(quarto.tipo)}</td>
            <td>R$ ${formatarValor(quarto.valorDiaria)}</td>
            <td>${quarto.incluiCafeDaManha ? "✅ Incluso" : "❌ Não incluso"}</td>
            <td><span class="status-badge status-${(quarto.statusOcupacao || '').toLowerCase()}">${formatarStatus(quarto.statusOcupacao)}</span></td>
            <td><span class="status-badge status-${(quarto.statusLimpeza || '').toLowerCase()}">${formatarStatus(quarto.statusLimpeza)}</span></td>
            ${colunaAcoes}
        `;
        tabela.appendChild(tr);
    });
}

// ============================================================
// RESUMO
// ============================================================

function atualizarResumo() {
    const total = quartos.length;
    const disponiveis = quartos.filter(q => q.statusOcupacao === "DISPONIVEL").length;
    const ocupados = quartos.filter(q => q.statusOcupacao === "OCUPADO").length;
    const manutencao = quartos.filter(q => q.statusOcupacao === "MANUTENCAO").length;

    document.getElementById("totalQuartos").textContent = total;
    document.getElementById("quartosDisponiveis").textContent = disponiveis;
    document.getElementById("quartosOcupados").textContent = ocupados;
    document.getElementById("quartosManutencao").textContent = manutencao;
}

// ============================================================
// SALVAR QUARTO (POST /api/quartos ou PUT /api/quartos/{id})
// ============================================================

async function salvarQuarto(evento) {
    evento.preventDefault();

    // Segurança extra: se não for ADMIN, bloqueia
    if (!usuarioLogado || usuarioLogado.papel !== 'ADMIN') {
        alert("Apenas administradores podem cadastrar ou editar quartos.");
        return;
    }

    const id = document.getElementById("quartoId").value;
    const numero = parseInt(document.getElementById("numero").value);
    const tipo = document.getElementById("tipo").value;
    const valorDiaria = parseFloat(document.getElementById("valorDiaria").value);
    const incluiCafeDaManha = document.getElementById("cafe").value === "true";
    const statusOcupacao = document.getElementById("statusOcupacao").value;
    const statusLimpeza = document.getElementById("statusLimpeza").value;

    // Validações
    if (!numero || !tipo || !valorDiaria) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    if (isNaN(valorDiaria) || valorDiaria <= 0) {
        alert("O valor da diária deve ser maior que zero.");
        return;
    }

    const dados = {
        numero,
        tipo,
        valorDiaria,
        incluiCafeDaManha,
        statusOcupacao,
        statusLimpeza
    };

    try {
        if (id) {
            // PUT /api/quartos/{id}
            await apiRequest(`/quartos/${id}`, "PUT", dados);
            alert("Quarto atualizado com sucesso!");
        } else {
            // POST /api/quartos
            await apiRequest("/quartos", "POST", dados);
            alert("Quarto cadastrado com sucesso!");
        }

        cancelarEdicao();
        carregarQuartos();

    } catch (error) {
        console.error("Erro ao salvar quarto:", error);
        alert("Erro ao salvar quarto: " + (error.message || "Tente novamente"));
    }
}

// ============================================================
// EDITAR QUARTO (GET /api/quartos/{id})
// ============================================================

async function editarQuarto(id) {
    // Segurança extra: se não for ADMIN, bloqueia
    if (!usuarioLogado || usuarioLogado.papel !== 'ADMIN') {
        alert("Apenas administradores podem editar quartos.");
        return;
    }

    try {
        const quarto = await apiRequest(`/quartos/${id}`, "GET");

        document.getElementById("quartoId").value = quarto.id;
        document.getElementById("numero").value = quarto.numero || "";
        document.getElementById("tipo").value = quarto.tipo || "";
        document.getElementById("valorDiaria").value = quarto.valorDiaria || "";
        document.getElementById("cafe").value = quarto.incluiCafeDaManha ? "true" : "false";
        document.getElementById("statusOcupacao").value = quarto.statusOcupacao || "DISPONIVEL";
        document.getElementById("statusLimpeza").value = quarto.statusLimpeza || "LIMPO";

        document.getElementById("tituloFormulario").textContent = "Editar quarto";
        document.getElementById("btnCancelar").classList.remove("hidden");

        window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (error) {
        console.error("Erro ao carregar quarto:", error);
        alert("Erro ao carregar quarto: " + (error.message || "Tente novamente"));
    }
}

// ============================================================
// EXCLUIR QUARTO (DELETE /api/quartos/{id})
// ============================================================

async function excluirQuarto(id) {
    // Segurança extra: se não for ADMIN, bloqueia
    if (!usuarioLogado || usuarioLogado.papel !== 'ADMIN') {
        alert("Apenas administradores podem excluir quartos.");
        return;
    }

    if (!confirm("Tem certeza que deseja excluir este quarto?")) {
        return;
    }

    try {
        await apiRequest(`/quartos/${id}`, "DELETE");
        alert("Quarto excluído com sucesso!");
        carregarQuartos();

    } catch (error) {
        console.error("Erro ao excluir quarto:", error);
        alert("Erro ao excluir quarto: " + (error.message || "Tente novamente"));
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
