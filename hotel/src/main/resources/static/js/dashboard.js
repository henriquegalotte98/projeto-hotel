/* ============================================================
   HOTELWEB - DASHBOARD
   SPRINT 7
============================================================ */


/* ============================================================
   CONFIGURAÇÃO DA API
============================================================ */

const API_BASE_URL =
    window.API_BASE_URL ||
    "http://localhost:8080/api";


/* ============================================================
   VARIÁVEIS DOS GRÁFICOS
============================================================ */

let graficoOcupacao = null;

let graficoReceita = null;


/* ============================================================
   DADOS DE DEMONSTRAÇÃO
   Usados caso a API ainda não esteja disponível.
============================================================ */

const dadosDemo = {

    dashboard: {

        ocupados: 48,

        disponiveis: 12,

        checkins: 8,

        manutencoes: 3,

        reservas: 31,

        taxaOcupacao: 80,

        receita: 28750.00

    },


    ocupacao: {

        labels: [
            "01/08",
            "05/08",
            "10/08",
            "15/08",
            "20/08",
            "25/08",
            "30/08"
        ],

        valores: [
            68,
            72,
            76,
            80,
            74,
            82,
            80
        ]

    },


    receita: {

        labels: [
            "01/08",
            "05/08",
            "10/08",
            "15/08",
            "20/08",
            "25/08",
            "30/08"
        ],

        valores: [
            3200,
            4500,
            3900,
            5100,
            4200,
            4600,
            3250
        ]

    },


    ranking: [

        {
            quarto: "Suite Presidencial 204",
            reservas: 24
        },

        {
            quarto: "Luxo 301",
            reservas: 19
        },

        {
            quarto: "Standard 105",
            reservas: 15
        },

        {
            quarto: "Suite 402",
            reservas: 13
        },

        {
            quarto: "Luxo 205",
            reservas: 11
        }

    ]

};


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        definirPeriodoInicial();

        carregarDashboard();

    }
);


/* ============================================================
   PERÍODO INICIAL
============================================================ */

function definirPeriodoInicial() {

    const hoje =
        new Date();


    const inicio =
        new Date();


    inicio.setDate(
        hoje.getDate() - 30
    );


    document.getElementById(
        "data-inicio"
    ).value =
        formatarDataInput(inicio);


    document.getElementById(
        "data-fim"
    ).value =
        formatarDataInput(hoje);

}


/* ============================================================
   FORMATO YYYY-MM-DD
============================================================ */

function formatarDataInput(data) {

    return data
        .toISOString()
        .split("T")[0];

}


/* ============================================================
   CARREGAR DASHBOARD
============================================================ */

async function carregarDashboard() {

    mostrarStatus(
        "Carregando informações..."
    );


    document.body.classList.add(
        "dashboard-loading"
    );


    try {

        const inicio =
            document.getElementById(
                "data-inicio"
            ).value;


        const fim =
            document.getElementById(
                "data-fim"
            ).value;


        /*
         * Endpoint esperado:
         *
         * GET /api/dashboard
         *
         * Exemplo:
         *
         * /api/dashboard?dataInicio=2026-08-01
         * &dataFim=2026-08-30
         */

        const dados =
            await buscarAPI(
                `/dashboard?dataInicio=${inicio}&dataFim=${fim}`
            );


        atualizarIndicadores(
            dados
        );


        await carregarGraficos(
            inicio,
            fim
        );


        await carregarRanking();


        await carregarReservas();


        mostrarStatus(
            "Dashboard atualizado com sucesso."
        );


    } catch (erro) {

        console.warn(
            "API indisponível. Utilizando dados de demonstração.",
            erro
        );


        carregarDadosDemo();


        mostrarStatus(
            "Modo demonstração: API ainda não disponível.",
            true
        );

    } finally {

        document.body.classList.remove(
            "dashboard-loading"
        );

    }

}


/* ============================================================
   BUSCAR API
============================================================ */

async function buscarAPI(endpoint) {

    const resposta =
        await fetch(
            API_BASE_URL + endpoint,
            {
                method: "GET",

                headers: {

                    "Content-Type":
                        "application/json"

                }
            }
        );


    if (!resposta.ok) {

        throw new Error(
            `Erro HTTP ${resposta.status}`
        );

    }


    return await resposta.json();

}


/* ============================================================
   ATUALIZAR INDICADORES
============================================================ */

function atualizarIndicadores(dados) {

    const dashboard =
        dados.dashboard ||
        dados;


    definirTexto(
        "total-ocupados",
        dashboard.ocupados ??
        dashboard.quartosOcupados ??
        0
    );


    definirTexto(
        "total-disponiveis",
        dashboard.disponiveis ??
        dashboard.quartosDisponiveis ??
        0
    );


    definirTexto(
        "total-checkins",
        dashboard.checkins ??
        dashboard.checkinsPendentes ??
        0
    );


    definirTexto(
        "total-manutencoes",
        dashboard.manutencoes ??
        0
    );


    definirTexto(
        "total-reservas",
        dashboard.reservas ??
        dashboard.totalReservas ??
        0
    );


    const taxa =
        dashboard.taxaOcupacao ??
        dashboard.ocupacao ??
        0;


    definirTexto(
        "taxa-ocupacao",
        `${Number(taxa).toFixed(1)}%`
    );


    definirTexto(
        "receita-periodo",
        formatarMoeda(
            dashboard.receita ??
            dashboard.receitaPeriodo ??
            0
        )
    );

}


/* ============================================================
   GRÁFICOS
============================================================ */

async function carregarGraficos(
    inicio,
    fim
) {

    try {

        /*
         * Endpoint:
         *
         * GET /api/relatorios/ocupacao
         */

        const ocupacao =
            await buscarAPI(
                `/relatorios/ocupacao?dataInicio=${inicio}&dataFim=${fim}`
            );


        /*
         * Endpoint:
         *
         * GET /api/relatorios/receita
         */

        const receita =
            await buscarAPI(
                `/relatorios/receita?dataInicio=${inicio}&dataFim=${fim}`
            );


        criarGraficoOcupacao(
            normalizarGrafico(
                ocupacao
            )
        );


        criarGraficoReceita(
            normalizarGrafico(
                receita
            )
        );


    } catch (erro) {

        console.warn(
            "Não foi possível carregar gráficos da API."
        );


        criarGraficoOcupacao(
            dadosDemo.ocupacao
        );


        criarGraficoReceita(
            dadosDemo.receita
        );

    }

}


/* ============================================================
   NORMALIZAR DADOS DE GRÁFICO
============================================================ */

function normalizarGrafico(dados) {

    if (
        dados &&
        dados.labels &&
        dados.valores
    ) {

        return dados;

    }


    if (
        Array.isArray(dados)
    ) {

        return {

            labels:
                dados.map(
                    item =>
                        item.data ||
                        item.periodo ||
                        item.label
                ),

            valores:
                dados.map(
                    item =>
                        item.valor ||
                        item.total ||
                        item.percentual ||
                        0
                )

        };

    }


    return {

        labels: [],

        valores: []

    };

}


/* ============================================================
   GRÁFICO DE OCUPAÇÃO
============================================================ */

function criarGraficoOcupacao(dados) {

    const canvas =
        document.getElementById(
            "graficoOcupacao"
        );


    if (!canvas) return;


    if (graficoOcupacao) {

        graficoOcupacao.destroy();

    }


    graficoOcupacao =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels:
                        dados.labels,

                    datasets: [

                        {

                            label:
                                "Taxa de ocupação (%)",

                            data:
                                dados.valores,

                            tension:
                                0.35,

                            fill:
                                true,

                            borderWidth:
                                3,

                            pointRadius:
                                4

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            max: 100,

                            ticks: {

                                callback:
                                    valor =>
                                        `${valor}%`

                            }

                        }

                    }

                }

            }
        );

}


/* ============================================================
   GRÁFICO DE RECEITA
============================================================ */

function criarGraficoReceita(dados) {

    const canvas =
        document.getElementById(
            "graficoReceita"
        );


    if (!canvas) return;


    if (graficoReceita) {

        graficoReceita.destroy();

    }


    graficoReceita =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels:
                        dados.labels,

                    datasets: [

                        {

                            label:
                                "Receita",

                            data:
                                dados.valores,

                            borderWidth:
                                1,

                            borderRadius:
                                6

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {

                            display: false

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback:
                                    valor =>
                                        formatarMoeda(
                                            valor
                                        )

                            }

                        }

                    }

                }

            }
        );

}


/* ============================================================
   RANKING DE QUARTOS
============================================================ */

async function carregarRanking() {

    try {

        /*
         * Endpoint:
         *
         * GET /api/relatorios/ranking-quartos
         */

        const dados =
            await buscarAPI(
                "/relatorios/ranking-quartos"
            );


        renderizarRanking(
            Array.isArray(dados)
                ? dados
                : dados.ranking
        );


    } catch (erro) {

        renderizarRanking(
            dadosDemo.ranking
        );

    }

}


/* ============================================================
   RENDERIZAR RANKING
============================================================ */

function renderizarRanking(
    ranking = []
) {

    const container =
        document.getElementById(
            "ranking-quartos"
        );


    if (!container) return;


    if (!ranking.length) {

        container.innerHTML = `

            <div class="loading-message">

                Nenhum dado encontrado.

            </div>

        `;

        return;

    }


    container.innerHTML =
        ranking
            .slice(0, 5)
            .map(
                (item, index) => `

                <div class="ranking-item">

                    <span class="ranking-position">

                        ${index + 1}

                    </span>


                    <div class="ranking-info">

                        <strong>

                            ${
                                item.quarto ||
                                item.nome ||
                                item.numero ||
                                "Quarto"
                            }

                        </strong>

                        <span>

                            ${
                                item.reservas ||
                                item.totalReservas ||
                                0
                            }

                            reservas

                        </span>

                    </div>


                    <i class="fa-solid fa-trophy ranking-trophy"></i>

                </div>

            `
            )
            .join("");

}


/* ============================================================
   RESERVAS
============================================================ */

async function carregarReservas() {

    try {

        /*
         * Endpoint:
         *
         * GET /api/reservas
         */

        const dados =
            await buscarAPI(
                "/reservas"
            );


        const reservas =
            Array.isArray(dados)
                ? dados
                : dados.reservas;


        renderizarReservas(
            reservas
        );


    } catch (erro) {

        /*
         * Mantém as reservas que já
         * estavam no HTML.
         */

        console.warn(
            "Reservas não puderam ser atualizadas."
        );

    }

}


/* ============================================================
   RENDERIZAR RESERVAS
============================================================ */

function renderizarReservas(
    reservas = []
) {

    const tabela =
        document.getElementById(
            "tabela-reservas"
        );


    if (!tabela || !reservas.length) {

        return;

    }


    tabela.innerHTML =
        reservas
            .slice(0, 5)
            .map(
                reserva => `

                <tr>

                    <td>

                        ${
                            reserva.hospede?.nome ||
                            reserva.hospedeNome ||
                            reserva.nomeHospede ||
                            "Hóspede"
                        }

                    </td>


                    <td>

                        <strong>

                            ${
                                reserva.quarto?.numero ||
                                reserva.quartoNumero ||
                                reserva.acomodacao ||
                                "Quarto"
                            }

                        </strong>

                    </td>


                    <td>

                        ${
                            formatarData(
                                reserva.data_checkin_prevista ||
                                reserva.dataCheckin ||
                                reserva.checkin
                            )
                        }

                    </td>


                    <td>

                        <span class="badge-status ocupado">

                            ${
                                reserva.status ||
                                "Confirmado"
                            }

                        </span>

                    </td>

                </tr>

            `
            )
            .join("");

}


/* ============================================================
   FILTRO POR PERÍODO
============================================================ */

function aplicarFiltroPeriodo() {

    const inicio =
        document.getElementById(
            "data-inicio"
        ).value;


    const fim =
        document.getElementById(
            "data-fim"
        ).value;


    if (!inicio || !fim) {

        mostrarStatus(
            "Informe a data inicial e final.",
            true
        );

        return;

    }


    if (inicio > fim) {

        mostrarStatus(
            "A data inicial não pode ser maior que a data final.",
            true
        );

        return;

    }


    carregarDashboard();

}


/* ============================================================
   PERÍODO RÁPIDO
============================================================ */

document.addEventListener(
    "change",
    event => {

        if (
            event.target.id !==
            "periodo-rapido"
        ) {

            return;

        }


        const dias =
            Number(
                event.target.value
            );


        const fim =
            new Date();


        const inicio =
            new Date();


        inicio.setDate(
            fim.getDate() - dias
        );


        document.getElementById(
            "data-inicio"
        ).value =
            formatarDataInput(
                inicio
            );


        document.getElementById(
            "data-fim"
        ).value =
            formatarDataInput(
                fim
            );

    }
);


/* ============================================================
   LIMPAR FILTRO
============================================================ */

function limparFiltroPeriodo() {

    definirPeriodoInicial();

    carregarDashboard();

}


/* ============================================================
   ATUALIZAR
============================================================ */

function atualizarDashboard() {

    carregarDashboard();

}


/* ============================================================
   DADOS DEMONSTRAÇÃO
============================================================ */

function carregarDadosDemo() {

    atualizarIndicadores(
        dadosDemo.dashboard
    );


    criarGraficoOcupacao(
        dadosDemo.ocupacao
    );


    criarGraficoReceita(
        dadosDemo.receita
    );


    renderizarRanking(
        dadosDemo.ranking
    );

}


/* ============================================================
   UTILITÁRIOS
============================================================ */

function definirTexto(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);


    if (elemento) {

        elemento.textContent =
            valor;

    }

}


/* ============================================================
   MOEDA
============================================================ */

function formatarMoeda(valor) {

    return Number(
        valor || 0
    ).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


/* ============================================================
   DATA
============================================================ */

function formatarData(data) {

    if (!data) {

        return "--";

    }


    const partes =
        String(data)
            .split("T")[0]
            .split("-");


    if (partes.length === 3) {

        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }


    return data;

}


/* ============================================================
   STATUS
============================================================ */

function mostrarStatus(
    mensagem,
    erro = false
) {

    const elemento =
        document.getElementById(
            "dashboard-status"
        );


    if (!elemento) return;


    elemento.className =
        erro
            ? "dashboard-status error"
            : "dashboard-status";


    elemento.innerHTML = `

        <i class="fa-solid ${
            erro
                ? "fa-circle-exclamation"
                : "fa-circle-check"
        }"></i>

        ${mensagem}

    `;

}


/* ============================================================
   LOGOUT
============================================================ */

function fazerLogout() {

    /*
     * Mantém compatibilidade
     * com o sistema existente.
     */

    if (
        typeof window.auth !==
        "undefined" &&
        typeof window.auth.logout ===
        "function"
    ) {

        window.auth.logout();

        return;

    }


    localStorage.removeItem(
        "usuario"
    );

    localStorage.removeItem(
        "token"
    );


    window.location.href =
        "login.html";

}