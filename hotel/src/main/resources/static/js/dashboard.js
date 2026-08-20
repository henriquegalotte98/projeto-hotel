// Dashboard: sessao, indicadores e operacoes de reserva.
(function () {
    "use strict";

    let usuarioLogado = null;

    document.addEventListener("DOMContentLoaded", inicializar);

    async function inicializar() {
        usuarioLogado = await carregarUsuario();
        if (!usuarioLogado) return;

        preencherUsuario(usuarioLogado);
        aplicarRegrasAtalhos(usuarioLogado.papel);
        window.aplicarRegrasMenu?.(usuarioLogado.papel);
        await carregarDados();
    }

    async function carregarUsuario() {
        try {
            const usuario = await apiRequest("/auth/me");
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
            return usuario;
        } catch (erro) {
            if (erro.status === 401 || erro.status === 403) {
                sairLocalmente();
                return null;
            }
            try {
                return JSON.parse(localStorage.getItem("usuarioLogado") || "null");
            } catch (_) {
                sairLocalmente();
                return null;
            }
        }
    }

    function preencherUsuario(usuario) {
        const nome = usuario.nome || "Usuário";
        const papel = normalizarPapel(usuario.papel);
        definirTexto("usuario-nome", nome);
        definirTexto("usuario-papel", formatarPapel(papel));
        definirTexto("avatar-inicial", iniciais(nome));

        const papelEl = document.getElementById("usuario-papel");
        if (papelEl) papelEl.className = `badge ${papel.toLowerCase()}`;
    }

    function aplicarRegrasAtalhos(papelInformado) {
        const papel = normalizarPapel(papelInformado);
        document.querySelectorAll(".dashboard-shortcut").forEach(atalho => {
            atalho.hidden = !(atalho.dataset.papeis || "").split(",").includes(papel);
        });
        const texto = document.querySelector("#atalho-quartos span");
        if (texto) texto.textContent = papel === "ADMIN" ? "Gerenciar Quartos" : "Visualizar Quartos";
    }

    async function carregarDados() {
        const papel = normalizarPapel(usuarioLogado.papel);
        const podeVerReservas = ["ADMIN", "RECEPCIONISTA"].includes(papel);
        const podeVerManutencao = ["ADMIN", "MANUTENCAO"].includes(papel);

        const [quartos, reservas, manutencoes] = await Promise.all([
            requisicaoSegura("/quartos"),
            podeVerReservas ? requisicaoSegura("/reservas") : Promise.resolve([]),
            podeVerManutencao ? requisicaoSegura("/manutencao") : Promise.resolve([])
        ]);

        definirTexto("quartos-ocupados", quartos.filter(q => q.statusOcupacao === "OCUPADO").length);
        definirTexto("quartos-disponiveis", quartos.filter(q => q.statusOcupacao === "DISPONIVEL").length);
        definirTexto("checkins-pendentes", reservas.filter(r => r.status === "RESERVADA").length);
        definirTexto("manutencoes", manutencoes.filter(m => !["CONCLUIDA", "CANCELADA"].includes(m.status)).length);

        if (podeVerReservas) renderizarReservas(reservas);
        else mostrarEstadoReservas("Reservas disponíveis para administradores e recepcionistas.");
    }

    async function requisicaoSegura(endpoint) {
        try {
            const dados = await apiRequest(endpoint);
            return Array.isArray(dados) ? dados : [];
        } catch (erro) {
            console.error(`Erro ao carregar ${endpoint}:`, erro);
            return [];
        }
    }

    function renderizarReservas(reservas) {
        const tbody = document.getElementById("lista-reservas");
        if (!tbody) return;
        tbody.replaceChildren();

        const recentes = [...reservas].sort((a, b) => Number(b.id || 0) - Number(a.id || 0)).slice(0, 5);
        if (!recentes.length) {
            mostrarEstadoReservas("Nenhuma reserva encontrada.");
            return;
        }

        recentes.forEach(reserva => {
            const linha = document.createElement("tr");
            adicionarCelula(linha, reserva.hospede?.nome || "-");
            adicionarCelula(linha, reserva.quarto?.numero ? `Quarto ${reserva.quarto.numero}` : "-");
            adicionarCelula(linha, formatarData(reserva.dataCheckinPrevista));

            const statusCelula = document.createElement("td");
            const status = document.createElement("span");
            status.className = `badge-status status-${String(reserva.status || "").toLowerCase()}`;
            status.textContent = reserva.status || "-";
            statusCelula.appendChild(status);
            linha.appendChild(statusCelula);

            const acoesCelula = document.createElement("td");
            const acoes = document.createElement("div");
            acoes.className = "reservation-actions";
            if (reserva.status === "RESERVADA") acoes.appendChild(criarBotaoOperacao("Check-in", "checkin", reserva.id));
            else if (reserva.status === "CHECKIN") acoes.appendChild(criarBotaoOperacao("Check-out", "checkout", reserva.id));
            else acoes.textContent = "-";
            acoesCelula.appendChild(acoes);
            linha.appendChild(acoesCelula);
            tbody.appendChild(linha);
        });
    }

    function criarBotaoOperacao(rotulo, operacao, reservaId) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className = `reservation-action ${operacao}`;
        botao.textContent = rotulo;
        botao.addEventListener("click", () => executarOperacao(botao, operacao, reservaId));
        return botao;
    }

    async function executarOperacao(botao, operacao, reservaId) {
        const nome = operacao === "checkin" ? "check-in" : "check-out";
        if (!confirm(`Confirmar ${nome} da reserva ${reservaId}?`)) return;
        botao.disabled = true;
        botao.textContent = "Processando...";
        try {
            await apiRequest(`/reservas/${reservaId}/${operacao}`, "POST");
            mostrarMensagem(`${nome === "check-in" ? "Check-in" : "Check-out"} realizado com sucesso.`, "success");
            renderizarReservas(await requisicaoSegura("/reservas"));
        } catch (erro) {
            mostrarMensagem(erro.data?.erro || erro.message || `Não foi possível realizar o ${nome}.`, "error");
            botao.disabled = false;
            botao.textContent = operacao === "checkin" ? "Check-in" : "Check-out";
        }
    }

    function mostrarEstadoReservas(mensagem) {
        const tbody = document.getElementById("lista-reservas");
        if (!tbody) return;
        const linha = document.createElement("tr");
        const celula = document.createElement("td");
        celula.colSpan = 5;
        celula.className = "reservation-state";
        celula.textContent = mensagem;
        linha.appendChild(celula);
        tbody.replaceChildren(linha);
    }

    function mostrarMensagem(mensagem, tipo) {
        const elemento = document.getElementById("mensagem-operacao");
        if (!elemento) return;
        elemento.textContent = mensagem;
        elemento.className = `operation-message visible ${tipo}`;
    }

    function adicionarCelula(linha, texto) {
        const celula = document.createElement("td");
        celula.textContent = texto;
        linha.appendChild(celula);
    }

    function fazerLogout() {
        apiRequest("/auth/logout", "POST").catch(() => {}).finally(sairLocalmente);
    }

    function sairLocalmente() {
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("token");
        location.href = "login.html";
    }

    function normalizarPapel(papel) { return String(papel || "").replace(/^ROLE_/, "").toUpperCase(); }
    function definirTexto(id, texto) { const el = document.getElementById(id); if (el) el.textContent = String(texto); }
    function iniciais(nome) { return nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "HW"; }
    function formatarPapel(papel) { return ({ ADMIN: "Administrador", RECEPCIONISTA: "Recepcionista", GOVERNANCA: "Governança", MANUTENCAO: "Manutenção" })[papel] || papel; }
    function formatarData(data) { if (!data) return "-"; const [a, m, d] = data.split("-"); return d && m && a ? `${d}/${m}/${a}` : data; }

    window.fazerLogout = fazerLogout;
})();
