// ============================================================
// RELATÓRIOS - SPRINT 6
// ============================================================

const RELATORIOS_API =
    typeof API_BASE_URL !== "undefined"
        ? API_BASE_URL
        : "/api";


let graficoFaturamento = null;
let graficoOcupacao = null;


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    configurarDatas();

    document
        .getElementById("btnFiltrar")
        .addEventListener("click", carregarRelatorios);

    document
        .getElementById("btnAtualizar")
        .addEventListener("click", carregarRelatorios);

    carregarRelatorios();
});


// ============================================================
// CONFIGURA DATAS
// ============================================================

function configurarDatas() {

    const hoje = new Date();

    const primeiroDia = new Date(
        hoje.getFullYear(),
        hoje.getMonth(),
        1
    );

    document.getElementById("dataInicio").value =
        formatarDataInput(primeiroDia);

    document.getElementById("dataFim").value =
        formatarDataInput(hoje);
}


// ============================================================
// DATA PARA INPUT
// ============================================================

function formatarDataInput(data) {

    const ano = data.getFullYear();

    const mes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        data.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


// ============================================================
// CARREGAR RELATÓRIOS
// ============================================================

async function carregarRelatorios() {

    const inicio =
        document.getElementById("dataInicio").value;

    const fim =
        document.getElementById("dataFim").value;


    if (!inicio || !fim) {

        alert(
            "Informe a data inicial e a data final."
        );

        return;
    }


    if (inicio > fim) {

        alert(
            "A data inicial não pode ser maior que a data final."
        );

        return;
    }


    mostrarCarregando();


    try {

        await Promise.all([
            carregarFaturamento(inicio, fim),
            carregarDiarias(inicio, fim),
            carregarRestaurante(inicio, fim),
            carregarReservas(),
            carregarOcupacao(),
            carregarGovernanca(),
            carregarManutencao()
        ]);

    } catch (erro) {

        console.error(
            "Erro ao carregar relatórios:",
            erro
        );

        alert(
            "Não foi possível carregar os relatórios."
        );
    }
}


// ============================================================
// FATURAMENTO
// GET /api/relatorios/faturamento
// ============================================================

async function carregarFaturamento(inicio, fim) {

    const url =
        `${RELATORIOS_API}/relatorios/faturamento` +
        `?inicio=${inicio}&fim=${fim}`;


    const resposta =
        await fetch(url);


    if (!resposta.ok) {

        throw new Error(
            `Erro no faturamento: ${resposta.status}`
        );
    }


    const dados =
        await resposta.json();


    console.log(
        "Faturamento:",
        dados
    );


    const total =
        obterValor(
            dados,
            [
                "total",
                "faturamento",
                "valor"
            ]
        );


    document.getElementById(
        "valorFaturamento"
    ).textContent =
        formatarMoeda(total);


    document.getElementById(
        "resumoFaturamento"
    ).textContent =
        formatarMoeda(total);


    document.getElementById(
        "periodoFaturamento"
    ).textContent =
        `${formatarDataBR(inicio)} até ${formatarDataBR(fim)}`;


    criarGraficoFaturamento(dados);
}


// ============================================================
// DIÁRIAS
// GET /api/relatorios/diarias
// ============================================================

async function carregarDiarias(inicio, fim) {

    const url =
        `${RELATORIOS_API}/relatorios/diarias` +
        `?inicio=${inicio}&fim=${fim}`;


    const resposta =
        await fetch(url);


    if (!resposta.ok) {

        throw new Error(
            `Erro nas diárias: ${resposta.status}`
        );
    }


    const dados =
        await resposta.json();


    console.log(
        "Diárias:",
        dados
    );


    const total =
        obterValor(
            dados,
            [
                "total",
                "diarias",
                "quantidade",
                "totalDiarias"
            ]
        );


    document.getElementById(
        "valorDiarias"
    ).textContent =
        formatarNumero(total);


    document.getElementById(
        "resumoDiarias"
    ).textContent =
        formatarNumero(total);
}


// ============================================================
// RESTAURANTE
// GET /api/relatorios/restaurante
// ============================================================

async function carregarRestaurante(inicio, fim) {

    const url =
        `${RELATORIOS_API}/relatorios/restaurante` +
        `?inicio=${inicio}&fim=${fim}`;


    const resposta =
        await fetch(url);


    if (!resposta.ok) {

        throw new Error(
            `Erro no restaurante: ${resposta.status}`
        );
    }


    const dados =
        await resposta.json();


    console.log(
        "Restaurante:",
        dados
    );


    preencherTabelaRestaurante(dados);
}


// ============================================================
// RESERVAS
// GET /api/relatorios/reservas
// ============================================================

async function carregarReservas() {

    const resposta =
        await fetch(
            `${RELATORIOS_API}/relatorios/reservas`
        );


    if (!resposta.ok) {

        throw new Error(
            `Erro nas reservas: ${resposta.status}`
        );
    }


    const dados =
        await resposta.json();


    console.log(
        "Reservas:",
        dados
    );


    const total =
        obterValor(
            dados,
            [
                "total",
                "quantidade",
                "reservas",
                "totalReservas"
            ]
        );


    document.getElementById(
        "resumoReservas"
    ).textContent =
        formatarNumero(total);
}


// ============================================================
// OCUPAÇÃO
// GET /api/relatorios/ocupacao
// ============================================================

async function carregarOcupacao() {

    const resposta =
        await fetch(
            `${RELATORIOS_API}/relatorios/ocupacao`
        );


    if (!resposta.ok) {

        throw new Error(
            `Erro na ocupação: ${resposta.status}`
        );
    }


    const dados =
        await resposta.json();


    console.log(
        "Ocupação:",
        dados
    );


    const ocupacao =
        obterValor(
            dados,
            [
                "ocupacao",
                "taxa",
                "percentual",
                "porcentagem",
                "taxaOcupacao"
            ]
        );


    document.getElementById(
        "valorOcupacao"
    ).textContent =
        `${formatarNumero(ocupacao)}%`;


    document.getElementById(
        "resumoOcupacao"
    ).textContent =
        `${formatarNumero(ocupacao)}%`;


    criarGraficoOcupacao(dados);
}


// ============================================================
// GOVERNANÇA
// ============================================================

async function carregarGovernanca() {

    const resposta =
        await fetch(
            `${RELATORIOS_API}/relatorios/governanca`
        );


    if (!resposta.ok) {

        throw new Error(
            `Erro na governança: ${resposta.status}`
        );
    }


    const dados =
        await resposta.json();


    console.log(
        "Governança:",
        dados
    );


    document.getElementById(
        "resumoGovernanca"
    ).textContent =
        formatarResumo(dados);
}


// ============================================================
// MANUTENÇÃO
// ============================================================

async function carregarManutencao() {

    const resposta =
        await fetch(
            `${RELATORIOS_API}/relatorios/manutencao`
        );


    if (!resposta.ok) {

        throw new Error(
            `Erro na manutenção: ${resposta.status}`
        );
    }


    const dados =
        await resposta.json();


    console.log(
        "Manutenção:",
        dados
    );


    document.getElementById(
        "resumoManutencao"
    ).textContent =
        formatarResumo(dados);
}


// ============================================================
// TABELA RESTAURANTE
// ============================================================

function preencherTabelaRestaurante(dados) {

    const tabela =
        document.getElementById(
            "tabelaRestaurante"
        );


    tabela.innerHTML = "";


    if (
        !Array.isArray(dados) ||
        dados.length === 0
    ) {

        tabela.innerHTML = `
            <tr>
                <td colspan="3" class="estado-vazio">
                    Nenhum item encontrado no período.
                </td>
            </tr>
        `;

        return;
    }


    dados.forEach(item => {

        const nome =
            item.nome ??
            item.item ??
            item.produto ??
            item.descricao ??
            "Não informado";


        const quantidade =
            item.quantidade ??
            item.qtd ??
            item.total ??
            0;


        const valor =
            item.valor ??
            item.faturamento ??
            item.totalValor ??
            item.preco ??
            0;


        const linha =
            document.createElement("tr");


        linha.innerHTML = `
            <td>${escaparHTML(nome)}</td>
            <td>${formatarNumero(quantidade)}</td>
            <td>${formatarMoeda(valor)}</td>
        `;


        tabela.appendChild(linha);
    });
}


// ============================================================
// GRÁFICO FATURAMENTO
// ============================================================

function criarGraficoFaturamento(dados) {

    const canvas =
        document.getElementById(
            "graficoFaturamento"
        );


    if (!canvas) {
        return;
    }


    const contexto =
        canvas.getContext("2d");


    if (graficoFaturamento) {
        graficoFaturamento.destroy();
    }


    const serie =
        extrairSerie(dados);


    graficoFaturamento =
        new Chart(
            contexto,
            {
                type: "line",

                data: {
                    labels: serie.labels,

                    datasets: [
                        {
                            label: "Faturamento",

                            data: serie.values,

                            borderWidth: 2,

                            tension: 0.3,

                            fill: false
                        }
                    ]
                },

                options: {
                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            }
        );
}


// ============================================================
// GRÁFICO OCUPAÇÃO
// ============================================================

function criarGraficoOcupacao(dados) {

    const canvas =
        document.getElementById(
            "graficoOcupacao"
        );


    if (!canvas) {
        return;
    }


    const contexto =
        canvas.getContext("2d");


    if (graficoOcupacao) {
        graficoOcupacao.destroy();
    }


    const serie =
        extrairSerie(dados);


    graficoOcupacao =
        new Chart(
            contexto,
            {
                type: "line",

                data: {
                    labels: serie.labels,

                    datasets: [
                        {
                            label: "Ocupação (%)",

                            data: serie.values,

                            borderWidth: 2,

                            tension: 0.3,

                            fill: false
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            }
        );
}


// ============================================================
// EXTRAI SÉRIE DO BACKEND
// ============================================================

function extrairSerie(dados) {

    if (Array.isArray(dados)) {

        const labels = [];
        const values = [];


        dados.forEach(item => {

            const label =
                item.data ??
                item.dia ??
                item.mes ??
                item.periodo ??
                item.nome ??
                "";


            const valor =
                item.total ??
                item.valor ??
                item.faturamento ??
                item.ocupacao ??
                item.taxa ??
                item.percentual ??
                0;


            labels.push(label);
            values.push(Number(valor) || 0);
        });


        return {
            labels,
            values
        };
    }


    const valor =
        obterValor(
            dados,
            [
                "total",
                "valor",
                "faturamento",
                "ocupacao",
                "taxa",
                "percentual",
                "taxaOcupacao"
            ]
        );


    return {
        labels: ["Período"],
        values: [Number(valor) || 0]
    };
}


// ============================================================
// PEGA VALOR DO OBJETO
// ============================================================

function obterValor(objeto, propriedades) {

    if (
        !objeto ||
        typeof objeto !== "object"
    ) {
        return 0;
    }


    for (const propriedade of propriedades) {

        if (
            objeto[propriedade] !== undefined &&
            objeto[propriedade] !== null
        ) {

            return objeto[propriedade];
        }
    }


    return 0;
}


// ============================================================
// MOEDA
// ============================================================

function formatarMoeda(valor) {

    return (
        Number(valor) || 0
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


// ============================================================
// NÚMERO
// ============================================================

function formatarNumero(valor) {

    return (
        Number(valor) || 0
    ).toLocaleString("pt-BR");
}


// ============================================================
// DATA BR
// ============================================================

function formatarDataBR(data) {

    if (!data) {
        return "";
    }


    const partes =
        data.split("-");


    if (partes.length !== 3) {
        return data;
    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// ============================================================
// RESUMO
// ============================================================

function formatarResumo(dados) {

    if (
        !dados ||
        typeof dados !== "object" ||
        Object.keys(dados).length === 0
    ) {
        return "-";
    }


    const valores =
        Object.entries(dados);


    if (valores.length === 1) {
        return String(valores[0][1]);
    }


    return valores
        .map(
            ([chave, valor]) =>
                `${chave}: ${valor}`
        )
        .join(" | ");
}


// ============================================================
// ESCAPA HTML
// ============================================================

function escaparHTML(valor) {

    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ============================================================
// CARREGANDO
// ============================================================

function mostrarCarregando() {

    document.getElementById(
        "valorFaturamento"
    ).textContent = "Carregando...";


    document.getElementById(
        "valorDiarias"
    ).textContent = "...";


    document.getElementById(
        "valorOcupacao"
    ).textContent = "...";
}