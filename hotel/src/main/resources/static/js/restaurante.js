(function () {
    "use strict";

    // Esta tela permite lançar consumos somente para hospedagens em andamento.
    document.addEventListener("DOMContentLoaded", inicializar);

    async function inicializar() {
        try {
            // Confirma a sessão real no back-end antes de confiar no localStorage.
            const usuario = await apiRequest("/auth/me");
            const papel = String(usuario.papel || "").replace(/^ROLE_/, "");
            if (!["ADMIN", "RECEPCIONISTA"].includes(papel)) {
                location.href = "dashboard.html";
                return;
            }
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
            preencherUsuario(usuario);
            window.aplicarRegrasMenu?.(papel);
            document.getElementById("form-consumo")?.addEventListener("submit", lancarConsumo);
            document.getElementById("reservaId")?.addEventListener("change", carregarConsumos);
            await carregarHospedagens();
        } catch (erro) {
            if (erro.status !== 401) alert(erro.message || "Não foi possível abrir o Restaurante.");
        }
    }

    function preencherUsuario(usuario) {
        const nome = usuario.nome || "Usuário";
        definirTexto("usuario-nome", nome);
        definirTexto("usuario-papel", String(usuario.papel || "").replace(/^ROLE_/, ""));
        definirTexto("avatar-inicial", nome.split(/\s+/).slice(0, 2).map(parte => parte[0]).join("").toUpperCase());
    }

    async function carregarHospedagens() {
        const seletor = document.getElementById("reservaId");
        const reservas = await apiRequest("/reservas");
        // Uma reserva só pode receber extras depois do check-in e antes do check-out.
        const ativas = (Array.isArray(reservas) ? reservas : []).filter(reserva => reserva.status === "CHECKIN");
        seletor.replaceChildren(criarOpcao("", ativas.length ? "Selecione a hospedagem" : "Nenhuma hospedagem com check-in", true));
        ativas.forEach(reserva => {
            const hospede = reserva.hospede?.nome || "Hóspede";
            const quarto = reserva.quarto?.numero || "-";
            seletor.appendChild(criarOpcao(reserva.id, `${hospede} — Quarto ${quarto} (reserva #${reserva.id})`));
        });
        seletor.disabled = ativas.length === 0;
    }

    async function carregarConsumos() {
        const reservaId = document.getElementById("reservaId")?.value;
        const lista = document.getElementById("lista-consumos");
        if (!reservaId) return;
        lista.textContent = "Carregando consumos...";
        try {
            const consumos = await apiRequest(`/consumos?reservaId=${reservaId}`);
            renderizarConsumos(Array.isArray(consumos) ? consumos : []);
        } catch (erro) {
            lista.textContent = erro.message || "Não foi possível carregar os consumos.";
        }
    }

    function renderizarConsumos(consumos) {
        const lista = document.getElementById("lista-consumos");
        lista.replaceChildren();
        if (!consumos.length) lista.textContent = "Nenhum consumo lançado para esta hospedagem.";
        // Elementos são criados com textContent para não inserir HTML vindo da API.
        consumos.forEach(consumo => {
            const item = document.createElement("div");
            item.className = "consumo-item";
            const descricao = document.createElement("span");
            descricao.textContent = consumo.descricao;
            const data = document.createElement("small");
            data.textContent = new Date(consumo.dataLancamento).toLocaleString("pt-BR");
            const valor = document.createElement("strong");
            valor.textContent = formatarMoeda(consumo.valor);
            item.append(descricao, data, valor);
            lista.appendChild(item);
        });
        // Recalcula o total sempre que a lista for atualizada.
        const total = consumos.reduce((soma, consumo) => soma + Number(consumo.valor || 0), 0);
        definirTexto("total-consumos", `Total: ${formatarMoeda(total)}`);
    }

    async function lancarConsumo(evento) {
        evento.preventDefault();
        const formulario = evento.currentTarget;
        const botao = formulario.querySelector('button[type="submit"]');
        const dados = {
            reservaId: Number(document.getElementById("reservaId").value),
            descricao: document.getElementById("descricao").value.trim(),
            valor: Number(document.getElementById("valor").value)
        };
        // Evita dois lançamentos quando o usuário clica repetidamente.
        botao.disabled = true;
        try {
            await apiRequest("/consumos", "POST", dados);
            document.getElementById("descricao").value = "";
            document.getElementById("valor").value = "";
            await carregarConsumos();
        } catch (erro) {
            alert(erro.message || "Não foi possível lançar o consumo.");
        } finally {
            botao.disabled = false;
        }
    }

    function criarOpcao(valor, texto, desabilitada = false) {
        const opcao = document.createElement("option");
        opcao.value = String(valor);
        opcao.textContent = texto;
        opcao.disabled = desabilitada;
        opcao.selected = desabilitada;
        return opcao;
    }

    function formatarMoeda(valor) { return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
    function definirTexto(id, texto) { const elemento = document.getElementById(id); if (elemento) elemento.textContent = texto; }
    function fazerLogout() { apiRequest("/auth/logout", "POST").catch(() => {}).finally(() => { localStorage.clear(); location.href = "login.html"; }); }
    window.fazerLogout = fazerLogout;
})();
