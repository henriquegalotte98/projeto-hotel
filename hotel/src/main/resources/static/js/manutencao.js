// Manutencao: abertura, acompanhamento e alteracao de status.
(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", inicializar);

    async function inicializar() {
        const usuario = obterUsuario();
        if (!usuario) return redirecionarLogin();
        const papel = String(usuario.papel || "").replace(/^ROLE_/, "");
        if (!["ADMIN", "MANUTENCAO"].includes(papel)) {
            location.href = "dashboard.html";
            return;
        }

        preencherUsuario(usuario);
        window.aplicarRegrasMenu?.(papel);
        document.getElementById("form-chamado")?.addEventListener("submit", criarChamado);
        document.getElementById("btn-fechar-modal")?.addEventListener("click", fecharModal);
        document.getElementById("modal-historico")?.addEventListener("click", evento => {
            if (evento.target.id === "modal-historico") fecharModal();
        });
        await carregarChamados();
    }

    function obterUsuario() {
        try { return JSON.parse(localStorage.getItem("usuarioLogado") || "null"); }
        catch (_) { return null; }
    }

    function preencherUsuario(usuario) {
        const nome = usuario.nome || "Usuário";
        const papel = String(usuario.papel || "").replace(/^ROLE_/, "");
        definirTexto("usuario-nome", nome);
        definirTexto("usuario-papel", ({ ADMIN: "Administrador", MANUTENCAO: "Manutenção" })[papel] || papel);
        definirTexto("avatar-inicial", nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase());
        const badge = document.getElementById("usuario-papel");
        if (badge) badge.className = `badge ${papel.toLowerCase()}`;
    }

    async function criarChamado(evento) {
        evento.preventDefault();
        const quartoId = Number(document.getElementById("quartoId")?.value);
        const descricao = document.getElementById("descricao")?.value.trim();
        if (!Number.isInteger(quartoId) || quartoId <= 0 || !descricao) return;

        try {
            await apiRequest("/manutencao", "POST", { quartoId, descricao });
            evento.currentTarget.reset();
            await carregarChamados();
        } catch (erro) {
            alert(erro.data?.erro || erro.message || "Não foi possível abrir o chamado.");
        }
    }

    async function carregarChamados() {
        limparColunas();
        try {
            const chamados = await apiRequest("/manutencao");
            (Array.isArray(chamados) ? chamados : []).forEach(renderizarChamado);
        } catch (erro) {
            console.error("Erro ao carregar chamados:", erro);
        }
    }

    function limparColunas() {
        ["ABERTA", "EM_ANDAMENTO", "CONCLUIDA"].forEach(status => {
            const lista = document.getElementById(`lista-${status}`);
            if (lista) lista.replaceChildren();
        });
    }

    function renderizarChamado(chamado) {
        const lista = document.getElementById(`lista-${chamado.status}`);
        if (!lista) return;

        const card = document.createElement("article");
        card.className = "chamado-card";
        const titulo = document.createElement("strong");
        titulo.textContent = `Quarto ${chamado.quartoId}`;
        const descricao = document.createElement("p");
        descricao.textContent = chamado.descricao;
        const data = document.createElement("small");
        data.textContent = `Aberto em ${formatarDataHora(chamado.abertaEm)}`;
        const acoes = document.createElement("div");
        acoes.className = "chamado-actions";

        if (chamado.status === "ABERTA") acoes.appendChild(botaoStatus(chamado.id, "Iniciar", "EM_ANDAMENTO"));
        if (chamado.status === "EM_ANDAMENTO") acoes.appendChild(botaoStatus(chamado.id, "Concluir", "CONCLUIDA"));
        const historico = document.createElement("button");
        historico.type = "button";
        historico.textContent = "Ver detalhes";
        historico.addEventListener("click", () => verHistorico(chamado.id));
        acoes.appendChild(historico);
        card.append(titulo, descricao, data, acoes);
        lista.appendChild(card);
    }

    function botaoStatus(id, rotulo, status) {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = rotulo;
        botao.addEventListener("click", async () => {
            botao.disabled = true;
            try {
                await apiRequest(`/manutencao/${id}/status?status=${status}`, "PATCH");
                await carregarChamados();
            } catch (erro) {
                alert(erro.data?.erro || erro.message || "Não foi possível atualizar o chamado.");
                botao.disabled = false;
            }
        });
        return botao;
    }

    async function verHistorico(id) {
        try {
            const chamado = await apiRequest(`/manutencao/${id}`);
            definirTexto("historico-id", `#${chamado.id}`);
            definirTexto("historico-quarto", `Quarto ${chamado.quartoId}`);
            definirTexto("historico-descricao", chamado.descricao);
            const lista = document.getElementById("lista-historico-status");
            lista.replaceChildren();
            adicionarEvento(lista, "ABERTA", chamado.abertaEm);
            if (chamado.status === "EM_ANDAMENTO") adicionarEvento(lista, "EM ANDAMENTO", null);
            if (chamado.concluidaEm) adicionarEvento(lista, "CONCLUÍDA", chamado.concluidaEm);
            document.getElementById("modal-historico")?.classList.remove("hidden");
        } catch (erro) {
            alert(erro.data?.erro || erro.message || "Não foi possível consultar o chamado.");
        }
    }

    function adicionarEvento(lista, status, data) {
        const item = document.createElement("li");
        item.textContent = data ? `${status} em ${formatarDataHora(data)}` : status;
        lista.appendChild(item);
    }

    function fecharModal() { document.getElementById("modal-historico")?.classList.add("hidden"); }
    function formatarDataHora(valor) { return valor ? new Date(valor).toLocaleString("pt-BR") : "-"; }
    function definirTexto(id, valor) { const el = document.getElementById(id); if (el) el.textContent = valor; }
    function redirecionarLogin() { location.href = "login.html"; }
    function fazerLogout() { apiRequest("/auth/logout", "POST").catch(() => {}).finally(() => { localStorage.clear(); redirecionarLogin(); }); }

    window.fazerLogout = fazerLogout;
})();
