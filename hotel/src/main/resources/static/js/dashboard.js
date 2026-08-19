// Painel executivo: usuario, indicadores e reservas recentes.
(function () {
    "use strict";

    let usuarioLogado = null;

    document.addEventListener("DOMContentLoaded", inicializarDashboard);

    async function inicializarDashboard() {
        usuarioLogado = await carregarUsuario();
        if (!usuarioLogado) return;

        preencherUsuario(usuarioLogado);
        window.aplicarRegrasMenu?.(usuarioLogado.papel);
        aplicarRegrasAtalhos(usuarioLogado.papel);
        await carregarIndicadores();
    }

    async function carregarUsuario() {
        try {
            const usuario = await apiRequest("/auth/me");
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
            return usuario;
        } catch (erro) {
            if (erro.status === 401 || erro.status === 403) {
                localStorage.removeItem("usuarioLogado");
                location.href = "login.html";
                return null;
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

    function escapar(valor) {
        return String(valor).replace(/[&<>'"]/g, caractere => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
        })[caractere]);
    }

    window.fazerLogout = fazerLogout;
})();
