// Relatorios administrativos integrados a API do HotelWeb.
(function () {
    "use strict";

    let graficoFaturamento;
    let graficoOcupacao;

    document.addEventListener("DOMContentLoaded", inicializar);

    async function inicializar() {
        const usuario = await carregarUsuario();
        if (!usuario) return;
        if (normalizarPapel(usuario.papel) !== "ADMIN") {
            location.href = "dashboard.html";
            return;
        }

        preencherUsuario(usuario);
        window.aplicarRegrasMenu?.(usuario.papel);
        configurarDatas();
        document.getElementById("btnFiltrar")?.addEventListener("click", carregarRelatorios);
        document.getElementById("btnAtualizar")?.addEventListener("click", carregarRelatorios);
        await carregarRelatorios();
    }

    async function carregarUsuario() {
        try {
            const usuario = await apiRequest("/auth/me");
            localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
            return usuario;
        } catch (_) {
            localStorage.removeItem("usuarioLogado");
            location.href = "login.html";
            return null;
        }
    }

    function preencherUsuario(usuario) {
        const nome = usuario.nome || "Usuário";
        definirTexto("usuario-nome", nome);
        definirTexto("usuario-papel", "Administrador");
        definirTexto("avatar-inicial", nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join("").toUpperCase());
        const badge = document.getElementById("usuario-papel");
        if (badge) badge.className = "badge admin";
    }

    function configurarDatas() {
        const hoje = new Date();
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        document.getElementById("dataInicio").value = dataInput(inicio);
        document.getElementById("dataFim").value = dataInput(hoje);
    }

    async function carregarRelatorios() {
        const inicio = document.getElementById("dataInicio")?.value;
        const fim = document.getElementById("dataFim")?.value;
        if (!inicio || !fim || inicio > fim) {
            alert("Informe um período válido.");
            return;
        }

        alternarCarregamento(true);
        try {
            const periodo = `?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`;
            const [faturamento, diarias, restaurante, reservas, ocupacao, governanca, manutencao] = await Promise.all([
                apiRequest(`/relatorios/faturamento${periodo}`),
                apiRequest(`/relatorios/diarias${periodo}`),
                apiRequest(`/relatorios/restaurante${periodo}`),
                apiRequest("/relatorios/reservas"),
                apiRequest("/relatorios/ocupacao"),
                apiRequest("/relatorios/governanca"),
                apiRequest("/relatorios/manutencao")
            ]);
            renderizar({ faturamento, diarias, restaurante, reservas, ocupacao, governanca, manutencao }, inicio, fim);
        } catch (erro) {
            console.error("Erro ao carregar relatórios:", erro);
            alert(erro.data?.erro || erro.message || "Não foi possível carregar os relatórios.");
        } finally {
            alternarCarregamento(false);
        }
    }

    function renderizar(dados, inicio, fim) {
        definirTexto("valorFaturamento", moeda(dados.faturamento.total));
        definirTexto("resumoFaturamento", moeda(dados.faturamento.total));
        definirTexto("periodoFaturamento", `${dataBR(inicio)} até ${dataBR(fim)}`);
        definirTexto("valorDiarias", numero(dados.diarias.total));
        definirTexto("resumoDiarias", numero(dados.diarias.total));
        definirTexto("valorOcupacao", `${numero(dados.ocupacao.taxaOcupacao)}%`);
        definirTexto("resumoOcupacao", `${numero(dados.ocupacao.taxaOcupacao)}%`);
        definirTexto("resumoReservas", numero(dados.reservas.total));
        definirTexto("resumoGovernanca", `${dados.governanca.sujos} sujos · ${dados.governanca.emLimpeza} em limpeza`);
        definirTexto("resumoManutencao", `${dados.manutencao.abertas} abertas · ${dados.manutencao.emAndamento} em andamento`);
        preencherRestaurante(dados.restaurante);
        desenharGraficos(dados.faturamento, dados.ocupacao);
    }

    function preencherRestaurante(itens) {
        const tbody = document.getElementById("tabelaRestaurante");
        if (!tbody) return;
        tbody.replaceChildren();
        if (!Array.isArray(itens) || !itens.length) {
            const linha = document.createElement("tr");
            const celula = document.createElement("td");
            celula.colSpan = 3;
            celula.className = "estado-vazio";
            celula.textContent = "Nenhum consumo encontrado no período.";
            linha.appendChild(celula);
            tbody.appendChild(linha);
            return;
        }
        itens.forEach(item => {
            const linha = document.createElement("tr");
            adicionarCelula(linha, item.descricao || "-");
            adicionarCelula(linha, numero(item.quantidade));
            adicionarCelula(linha, moeda(item.total));
            tbody.appendChild(linha);
        });
    }

    function desenharGraficos(faturamento, ocupacao) {
        if (typeof window.Chart !== "function") {
            mostrarGraficoIndisponivel("graficoFaturamento");
            mostrarGraficoIndisponivel("graficoOcupacao");
            return;
        }
        graficoFaturamento?.destroy();
        graficoOcupacao?.destroy();
        graficoFaturamento = criarGrafico("graficoFaturamento", "bar", ["Diárias", "Consumos"],
                [faturamento.totalDiarias, faturamento.totalConsumos], "Faturamento (R$)");
        graficoOcupacao = criarGrafico("graficoOcupacao", "doughnut", ["Ocupados", "Disponíveis", "Manutenção"],
                [ocupacao.ocupados, ocupacao.disponiveis, ocupacao.emManutencao], "Quartos");
    }

    function criarGrafico(id, tipo, labels, valores, rotulo) {
        const canvas = document.getElementById(id);
        if (!canvas) return null;
        return new Chart(canvas, {
            type: tipo,
            data: { labels, datasets: [{ label: rotulo, data: valores, backgroundColor: ["#b45309", "#0f766e", "#dc2626"] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" } } }
        });
    }

    function mostrarGraficoIndisponivel(id) {
        const canvas = document.getElementById(id);
        if (!canvas || canvas.parentElement.querySelector(".grafico-indisponivel")) return;
        canvas.hidden = true;
        const aviso = document.createElement("p");
        aviso.className = "grafico-indisponivel";
        aviso.textContent = "Gráfico indisponível. Os indicadores continuam atualizados.";
        canvas.parentElement.appendChild(aviso);
    }

    function alternarCarregamento(carregando) {
        ["btnFiltrar", "btnAtualizar"].forEach(id => {
            const botao = document.getElementById(id);
            if (botao) botao.disabled = carregando;
        });
    }

    function adicionarCelula(linha, valor) { const td = document.createElement("td"); td.textContent = valor; linha.appendChild(td); }
    function definirTexto(id, valor) { const el = document.getElementById(id); if (el) el.textContent = String(valor ?? "-"); }
    function normalizarPapel(papel) { return String(papel || "").replace(/^ROLE_/, "").toUpperCase(); }
    function dataInput(data) { const local = new Date(data.getTime() - data.getTimezoneOffset() * 60000); return local.toISOString().slice(0, 10); }
    function dataBR(data) { const [a, m, d] = data.split("-"); return `${d}/${m}/${a}`; }
    function numero(valor) { return (Number(valor) || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 }); }
    function moeda(valor) { return (Number(valor) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
    function fazerLogout() { apiRequest("/auth/logout", "POST").catch(() => {}).finally(() => { localStorage.clear(); location.href = "login.html"; }); }

    window.fazerLogout = fazerLogout;
})();
