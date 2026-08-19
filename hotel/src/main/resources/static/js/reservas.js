/* =========================================================
   HOTELWEB - RESERVAS
   JavaScript da página de reservas
========================================================= */


/* =========================================================
   CONFIGURAÇÃO
========================================================= */

const API_BASE = "/api";


let reservas = [];
let hospedes = [];
let quartos = [];

let reservaSelecionada = null;


/* =========================================================
   ELEMENTOS
========================================================= */

const form = document.getElementById("reservaForm");

const hospedeSelect =
    document.getElementById("hospede");

const quartoSelect =
    document.getElementById("quarto");

const checkinInput =
    document.getElementById("checkin");

const checkoutInput =
    document.getElementById("checkout");

const quartoInfo =
    document.getElementById("quartoInfo");

const quartoNumero =
    document.getElementById("quartoNumero");

const quartoTipo =
    document.getElementById("quartoTipo");

const quartoValor =
    document.getElementById("quartoValor");

const resumoPeriodo =
    document.getElementById("resumoPeriodo");

const resumoDiarias =
    document.getElementById("resumoDiarias");

const resumoValor =
    document.getElementById("resumoValor");


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    definirDatasMinimas();

    carregarDados();

    configurarEventos();

});


/* =========================================================
   CARREGAR DADOS
========================================================= */

async function carregarDados() {

    try {

        await Promise.all([
            carregarHospedes(),
            carregarQuartos(),
            carregarReservas()
        ]);

        atualizarEstatisticas();

    } catch (erro) {

        console.error(
            "Erro ao carregar dados:",
            erro
        );

        mostrarAlerta(
            "Não foi possível carregar os dados do sistema.",
            "error"
        );

    }

}


/* =========================================================
   HÓSPEDES
========================================================= */

async function carregarHospedes() {

    try {

        const resposta =
            await fetch(`${API_BASE}/hospedes`, {
                credentials: "include"
            });

        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar hóspedes."
            );

        }

        hospedes = await resposta.json();

        preencherHospedes();

    } catch (erro) {

        console.error(erro);

        /*
         * Caso o Back-End ainda não esteja conectado,
         * o select continuará funcionando normalmente.
         */

        hospedes = [];

    }

}


function preencherHospedes() {

    hospedeSelect.innerHTML = `
        <option value="">
            Selecione o hóspede
        </option>
    `;

    hospedes.forEach(hospede => {

        const option =
            document.createElement("option");

        option.value = hospede.id;

        option.textContent =
            `${hospede.nome} - CPF: ${formatarCPF(hospede.cpf)}`;

        hospedeSelect.appendChild(option);

    });

}


/* =========================================================
   QUARTOS
========================================================= */

async function carregarQuartos() {

    try {

        const resposta =
            await fetch(`${API_BASE}/quartos`, {
                credentials: "include"
            });

        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar quartos."
            );

        }

        quartos = await resposta.json();

        preencherQuartos();

    } catch (erro) {

        console.error(erro);

        quartos = [];

    }

}


function preencherQuartos() {

    quartoSelect.innerHTML = `
        <option value="">
            Selecione o quarto
        </option>
    `;

    quartos.forEach(quarto => {

        /*
         * Quartos em manutenção não podem ser reservados.
         */

        if (
            String(quarto.statusOcupacao)
                .toUpperCase() === "MANUTENCAO"
        ) {

            return;

        }

        const option =
            document.createElement("option");

        option.value = quarto.id;

        option.dataset.valor =
            quarto.valorDiaria || 0;

        option.textContent =
            `Quarto ${quarto.numero} - ${formatarTipo(quarto.tipo)} - ${formatarMoeda(quarto.valorDiaria)}/dia`;

        quartoSelect.appendChild(option);

    });

}


/* =========================================================
   RESERVAS
========================================================= */

async function carregarReservas() {

    try {

        const resposta =
            await fetch(`${API_BASE}/reservas`, {
                credentials: "include"
            });

        if (!resposta.ok) {

            throw new Error(
                "Erro ao buscar reservas."
            );

        }

        reservas = await resposta.json();

        renderizarReservas();

        atualizarEstatisticas();

    } catch (erro) {

        console.error(erro);

        reservas = [];

        renderizarReservas();

    }

}


/* =========================================================
   RENDERIZAR TABELA
========================================================= */

function renderizarReservas(lista = reservas) {

    const tbody =
        document.getElementById("reservasTable");

    const resultadoTexto =
        document.getElementById("resultadoTexto");


    if (!lista.length) {

        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="loading">
                    Nenhuma reserva encontrada.
                </td>
            </tr>
        `;

        resultadoTexto.textContent =
            "Nenhuma reserva encontrada.";

        return;

    }


    resultadoTexto.textContent =
        `${lista.length} reserva(s) encontrada(s).`;


    tbody.innerHTML = "";


    lista.forEach(reserva => {

        const tr =
            document.createElement("tr");


        const hospede =
            encontrarHospede(
                reserva.hospedeId ||
                reserva.hospede_id ||
                reserva.hospede?.id
            );


        const quarto =
            encontrarQuarto(
                reserva.quartoId ||
                reserva.quarto_id ||
                reserva.quarto?.id
            );


        const nomeHospede =
            reserva.hospede?.nome ||
            hospede?.nome ||
            "Não informado";


        const numeroQuarto =
            reserva.quarto?.numero ||
            quarto?.numero ||
            "—";


        const checkin =
            reserva.dataCheckinPrevista ||
            reserva.data_checkin_prevista ||
            reserva.checkinPrevisto ||
            "—";


        const checkout =
            reserva.dataCheckoutPrevista ||
            reserva.data_checkout_prevista ||
            reserva.checkoutPrevisto ||
            "—";


        const diarias =
            calcularDiarias(
                checkin,
                checkout
            );


        const status =
            String(
                reserva.status || "RESERVADA"
            ).toUpperCase();


        tr.innerHTML = `

            <td>
                #${reserva.id}
            </td>

            <td>
                <strong>
                    ${escaparHTML(nomeHospede)}
                </strong>
            </td>

            <td>
                Quarto ${escaparHTML(numeroQuarto)}
            </td>

            <td>
                ${formatarData(checkin)}
            </td>

            <td>
                ${formatarData(checkout)}
            </td>

            <td>
                ${diarias}
            </td>

            <td>
                ${criarBadgeStatus(status)}
            </td>

            <td>

                <div class="table-actions">

                    <button
                        class="btn btn-secondary btn-small"
                        onclick="verDetalhes(${reserva.id})">

                        👁️

                    </button>

                    ${
                        status === "RESERVADA"
                        ?
                        `
                        <button
                            class="btn btn-danger btn-small"
                            onclick="cancelarReserva(${reserva.id})">

                            Cancelar

                        </button>
                        `
                        :
                        ""
                    }

                </div>

            </td>

        `;


        tbody.appendChild(tr);

    });

}


/* =========================================================
   CRIAR RESERVA
========================================================= */

form.addEventListener("submit", async event => {

    event.preventDefault();


    const hospedeId =
        hospedeSelect.value;

    const quartoId =
        quartoSelect.value;

    const checkin =
        checkinInput.value;

    const checkout =
        checkoutInput.value;


    if (
        !hospedeId ||
        !quartoId ||
        !checkin ||
        !checkout
    ) {

        mostrarAlerta(
            "Preencha todos os campos obrigatórios.",
            "error"
        );

        return;

    }


    if (!validarDatas(checkin, checkout)) {

        return;

    }


    try {

        const resposta =
            await fetch(`${API_BASE}/reservas`, {

                method: "POST",

                credentials: "include",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    hospedeId: Number(hospedeId),

                    quartoId: Number(quartoId),

                    dataCheckinPrevista:
                        checkin,

                    dataCheckoutPrevista:
                        checkout

                })

            });


        if (!resposta.ok) {

            const erro =
                await obterErroResposta(resposta);

            throw new Error(erro);

        }


        const reservaCriada =
            await resposta.json();


        mostrarAlerta(
            `Reserva #${reservaCriada.id || ""} criada com sucesso!`,
            "success"
        );


        limparFormulario();


        await carregarReservas();

    } catch (erro) {

        console.error(erro);

        mostrarAlerta(
            erro.message ||
            "Não foi possível criar a reserva.",
            "error"
        );

    }

});


/* =========================================================
   VERIFICAR DISPONIBILIDADE
========================================================= */

document
    .getElementById("btnVerificar")
    .addEventListener("click", async () => {


        const quartoId =
            quartoSelect.value;

        const checkin =
            checkinInput.value;

        const checkout =
            checkoutInput.value;


        if (
            !quartoId ||
            !checkin ||
            !checkout
        ) {

            mostrarAlerta(
                "Selecione o quarto e informe as datas.",
                "error"
            );

            return;

        }


        if (!validarDatas(checkin, checkout)) {

            return;

        }


        const disponivel =
            verificarDisponibilidadeLocal(
                Number(quartoId),
                checkin,
                checkout
            );


        if (disponivel) {

            mostrarAlerta(
                "✓ O quarto está disponível para o período selecionado.",
                "success"
            );

        } else {

            mostrarAlerta(
                "✕ O quarto possui conflito com outra reserva.",
                "error"
            );

        }

    });


/* =========================================================
   VERIFICAÇÃO LOCAL DE CONFLITO
========================================================= */

function verificarDisponibilidadeLocal(
    quartoId,
    novaEntrada,
    novaSaida
) {

    const inicioNovo =
        converterData(novaEntrada);

    const fimNovo =
        converterData(novaSaida);


    return !reservas.some(reserva => {

        const status =
            String(
                reserva.status || ""
            ).toUpperCase();


        /*
         * Reservas canceladas não bloqueiam o quarto.
         */

        if (status === "CANCELADA") {

            return false;

        }


        const idQuarto =
            Number(
                reserva.quartoId ||
                reserva.quarto_id ||
                reserva.quarto?.id
            );


        if (idQuarto !== Number(quartoId)) {

            return false;

        }


        const entrada =
            reserva.dataCheckinPrevista ||
            reserva.data_checkin_prevista;


        const saida =
            reserva.dataCheckoutPrevista ||
            reserva.data_checkout_prevista;


        if (!entrada || !saida) {

            return false;

        }


        const inicioExistente =
            converterData(entrada);

        const fimExistente =
            converterData(saida);


        /*
         * Existe conflito quando os períodos se sobrepõem.
         */

        return (
            inicioNovo < fimExistente &&
            fimNovo > inicioExistente
        );

    });

}


/* =========================================================
   CANCELAR RESERVA
========================================================= */

async function cancelarReserva(id) {

    const confirmar =
        confirm(
            `Deseja realmente cancelar a reserva #${id}?`
        );


    if (!confirmar) {

        return;

    }


    try {

        const resposta =
            await fetch(
                `${API_BASE}/reservas/${id}/cancelar`,
                {
                    method: "PATCH",
                    credentials: "include"
                }
            );


        /*
         * Alguns Back-Ends podem implementar
         * cancelamento com PUT.
         *
         * Se o PATCH não existir, tentamos PUT.
         */

        if (!resposta.ok) {

            const segundaTentativa =
                await fetch(
                    `${API_BASE}/reservas/${id}/cancelar`,
                    {
                        method: "PUT",
                        credentials: "include"
                    }
                );


            if (!segundaTentativa.ok) {

                throw new Error(
                    await obterErroResposta(
                        segundaTentativa
                    )
                );

            }

        }


        mostrarAlerta(
            "Reserva cancelada com sucesso.",
            "success"
        );


        await carregarReservas();

    } catch (erro) {

        console.error(erro);

        mostrarAlerta(
            erro.message ||
            "Não foi possível cancelar a reserva.",
            "error"
        );

    }

}


/* =========================================================
   DETALHES
========================================================= */

function verDetalhes(id) {

    const reserva =
        reservas.find(
            item => Number(item.id) === Number(id)
        );


    if (!reserva) {

        mostrarAlerta(
            "Reserva não encontrada.",
            "error"
        );

        return;

    }


    reservaSelecionada =
        reserva;


    const hospede =
        encontrarHospede(
            reserva.hospedeId ||
            reserva.hospede_id ||
            reserva.hospede?.id
        );


    const quarto =
        encontrarQuarto(
            reserva.quartoId ||
            reserva.quarto_id ||
            reserva.quarto?.id
        );


    const nomeHospede =
        reserva.hospede?.nome ||
        hospede?.nome ||
        "Não informado";


    const numeroQuarto =
        reserva.quarto?.numero ||
        quarto?.numero ||
        "Não informado";


    const checkin =
        reserva.dataCheckinPrevista ||
        reserva.data_checkin_prevista;


    const checkout =
        reserva.dataCheckoutPrevista ||
        reserva.data_checkout_prevista;


    const diarias =
        calcularDiarias(
            checkin,
            checkout
        );


    const valorDiaria =
        Number(
            reserva.quarto?.valorDiaria ||
            quarto?.valorDiaria ||
            0
        );


    const valorTotal =
        diarias * valorDiaria;


    document.getElementById(
        "detalhesReserva"
    ).innerHTML = `

        <div class="detail-grid">

            <div class="detail-item">

                <span>
                    Número da reserva
                </span>

                <strong>
                    #${reserva.id}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Status
                </span>

                ${criarBadgeStatus(
                    String(
                        reserva.status ||
                        "RESERVADA"
                    ).toUpperCase()
                )}

            </div>


            <div class="detail-item">

                <span>
                    Hóspede
                </span>

                <strong>
                    ${escaparHTML(nomeHospede)}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Quarto
                </span>

                <strong>
                    ${escaparHTML(numeroQuarto)}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Check-in previsto
                </span>

                <strong>
                    ${formatarData(checkin)}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Check-out previsto
                </span>

                <strong>
                    ${formatarData(checkout)}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Quantidade de diárias
                </span>

                <strong>
                    ${diarias}
                </strong>

            </div>


            <div class="detail-item">

                <span>
                    Valor estimado
                </span>

                <strong>
                    ${formatarMoeda(valorTotal)}
                </strong>

            </div>

        </div>

    `;


    document
        .getElementById("modalDetalhes")
        .classList.remove("hidden");

}


/* =========================================================
   FECHAR MODAL
========================================================= */

function fecharModal() {

    document
        .getElementById("modalDetalhes")
        .classList.add("hidden");

}


document
    .getElementById("fecharModal")
    .addEventListener(
        "click",
        fecharModal
    );


document
    .getElementById("fecharModalBtn")
    .addEventListener(
        "click",
        fecharModal
    );


document
    .getElementById("modalDetalhes")
    .addEventListener(
        "click",
        event => {

            if (
                event.target.id ===
                "modalDetalhes"
            ) {

                fecharModal();

            }

        }
    );


/* =========================================================
   FILTROS
========================================================= */

document
    .getElementById("btnFiltrar")
    .addEventListener(
        "click",
        aplicarFiltros
    );


document
    .getElementById("filtroBusca")
    .addEventListener(
        "input",
        aplicarFiltros
    );


document
    .getElementById("filtroStatus")
    .addEventListener(
        "change",
        aplicarFiltros
    );


function aplicarFiltros() {

    const busca =
        document
            .getElementById("filtroBusca")
            .value
            .toLowerCase()
            .trim();


    const dataInicio =
        document
            .getElementById("filtroCheckin")
            .value;


    const dataFim =
        document
            .getElementById("filtroCheckout")
            .value;


    const statusFiltro =
        document
            .getElementById("filtroStatus")
            .value;


    const resultado =
        reservas.filter(reserva => {


            const hospede =
                encontrarHospede(
                    reserva.hospedeId ||
                    reserva.hospede_id ||
                    reserva.hospede?.id
                );


            const quarto =
                encontrarQuarto(
                    reserva.quartoId ||
                    reserva.quarto_id ||
                    reserva.quarto?.id
                );


            const nome =
                (
                    reserva.hospede?.nome ||
                    hospede?.nome ||
                    ""
                ).toLowerCase();


            const numero =
                String(
                    reserva.quarto?.numero ||
                    quarto?.numero ||
                    ""
                ).toLowerCase();


            const checkin =
                reserva.dataCheckinPrevista ||
                reserva.data_checkin_prevista ||
                "";


            const checkout =
                reserva.dataCheckoutPrevista ||
                reserva.data_checkout_prevista ||
                "";


            const status =
                String(
                    reserva.status || ""
                ).toUpperCase();


            const correspondeBusca =
                !busca ||
                nome.includes(busca) ||
                numero.includes(busca);


            const correspondeInicio =
                !dataInicio ||
                checkin >= dataInicio;


            const correspondeFim =
                !dataFim ||
                checkout <= dataFim;


            const correspondeStatus =
                !statusFiltro ||
                status === statusFiltro;


            return (
                correspondeBusca &&
                correspondeInicio &&
                correspondeFim &&
                correspondeStatus
            );

        });


    renderizarReservas(resultado);

}


/* =========================================================
   LIMPAR FILTROS
========================================================= */

document
    .getElementById("btnLimparFiltros")
    .addEventListener("click", () => {

        document.getElementById(
            "filtroBusca"
        ).value = "";

        document.getElementById(
            "filtroCheckin"
        ).value = "";

        document.getElementById(
            "filtroCheckout"
        ).value = "";

        document.getElementById(
            "filtroStatus"
        ).value = "";


        renderizarReservas();

    });


/* =========================================================
   ATUALIZAR
========================================================= */

document
    .getElementById("btnAtualizar")
    .addEventListener(
        "click",
        carregarDados
    );


/* =========================================================
   LIMPAR FORMULÁRIO
========================================================= */

document
    .getElementById("btnLimpar")
    .addEventListener(
        "click",
        limparFormulario
    );


function limparFormulario() {

    form.reset();

    quartoInfo.classList.add(
        "hidden"
    );


    resumoPeriodo.textContent =
        "Selecione as datas";


    resumoDiarias.textContent =
        "0";


    resumoValor.textContent =
        "R$ 0,00";

}


/* =========================================================
   QUARTO SELECIONADO
========================================================= */

quartoSelect.addEventListener(
    "change",
    atualizarQuarto
);


function atualizarQuarto() {

    const id =
        Number(
            quartoSelect.value
        );


    const quarto =
        encontrarQuarto(id);


    if (!quarto) {

        quartoInfo.classList.add(
            "hidden"
        );

        atualizarResumo();

        return;

    }


    quartoInfo.classList.remove(
        "hidden"
    );


    quartoNumero.textContent =
        `Quarto ${quarto.numero}`;


    quartoTipo.textContent =
        formatarTipo(quarto.tipo);


    quartoValor.textContent =
        formatarMoeda(
            quarto.valorDiaria
        );


    atualizarResumo();

}


/* =========================================================
   DATAS
========================================================= */

checkinInput.addEventListener(
    "change",
    () => {

        if (
            checkoutInput.value &&
            checkinInput.value >
                checkoutInput.value
        ) {

            checkoutInput.value = "";

        }

        atualizarResumo();

    }
);


checkoutInput.addEventListener(
    "change",
    atualizarResumo
);


function atualizarResumo() {

    const entrada =
        checkinInput.value;


    const saida =
        checkoutInput.value;


    if (!entrada || !saida) {

        resumoPeriodo.textContent =
            "Selecione as datas";

        resumoDiarias.textContent =
            "0";

        resumoValor.textContent =
            "R$ 0,00";

        return;

    }


    const diarias =
        calcularDiarias(
            entrada,
            saida
        );


    const quarto =
        encontrarQuarto(
            Number(quartoSelect.value)
        );


    const valorDiaria =
        Number(
            quarto?.valorDiaria || 0
        );


    const valor =
        diarias * valorDiaria;


    resumoPeriodo.textContent =
        `${formatarData(entrada)} até ${formatarData(saida)}`;


    resumoDiarias.textContent =
        diarias;


    resumoValor.textContent =
        formatarMoeda(valor);

}


/* =========================================================
   VALIDAÇÃO DE DATAS
========================================================= */

function validarDatas(
    entrada,
    saida
) {

    const inicio =
        converterData(entrada);


    const fim =
        converterData(saida);


    if (inicio >= fim) {

        mostrarAlerta(
            "A data de check-out deve ser posterior ao check-in.",
            "error"
        );

        return false;

    }


    const hoje =
        converterData(
            obterDataHoje()
        );


    if (inicio < hoje) {

        mostrarAlerta(
            "A data de check-in não pode ser anterior a hoje.",
            "error"
        );

        return false;

    }


    return true;

}


/* =========================================================
   DATA MÍNIMA
========================================================= */

function definirDatasMinimas() {

    const hoje =
        obterDataHoje();


    checkinInput.min =
        hoje;


    checkoutInput.min =
        hoje;

}


/* =========================================================
   ESTATÍSTICAS
========================================================= */

function atualizarEstatisticas() {

    const total =
        reservas.length;


    const reservadas =
        reservas.filter(
            reserva =>
                String(
                    reserva.status
                ).toUpperCase() ===
                "RESERVADA"
        ).length;


    const checkin =
        reservas.filter(
            reserva =>
                String(
                    reserva.status
                ).toUpperCase() ===
                "CHECKIN"
        ).length;


    const canceladas =
        reservas.filter(
            reserva =>
                String(
                    reserva.status
                ).toUpperCase() ===
                "CANCELADA"
        ).length;


    document.getElementById(
        "totalReservas"
    ).textContent = total;


    document.getElementById(
        "reservasAtivas"
    ).textContent = reservadas;


    document.getElementById(
        "reservasCheckin"
    ).textContent = checkin;


    document.getElementById(
        "reservasCanceladas"
    ).textContent = canceladas;

}


/* =========================================================
   UTILITÁRIOS
========================================================= */

function encontrarHospede(id) {

    return hospedes.find(
        hospede =>
            Number(hospede.id) ===
            Number(id)
    );

}


function encontrarQuarto(id) {

    return quartos.find(
        quarto =>
            Number(quarto.id) ===
            Number(id)
    );

}


function calcularDiarias(
    entrada,
    saida
) {

    if (!entrada || !saida) {

        return 0;

    }


    const inicio =
        converterData(entrada);


    const fim =
        converterData(saida);


    const diferenca =
        fim - inicio;


    const dias =
        Math.ceil(
            diferenca /
            (1000 * 60 * 60 * 24)
        );


    return dias > 0 ? dias : 0;

}


function converterData(data) {

    if (!data) {

        return null;

    }


    const partes =
        String(data)
            .substring(0, 10)
            .split("-");


    return new Date(
        Number(partes[0]),
        Number(partes[1]) - 1,
        Number(partes[2])
    );

}


function obterDataHoje() {

    const hoje =
        new Date();


    const ano =
        hoje.getFullYear();


    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");


    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;

}


function formatarData(data) {

    if (!data) {

        return "—";

    }


    const partes =
        String(data)
            .substring(0, 10)
            .split("-");


    if (partes.length !== 3) {

        return data;

    }


    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function formatarMoeda(valor) {

    return Number(valor || 0)
        .toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

}


function formatarCPF(cpf) {

    if (!cpf) {

        return "";

    }


    const numero =
        String(cpf)
            .replace(/\D/g, "");


    if (numero.length !== 11) {

        return cpf;

    }


    return numero.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
    );

}


function formatarTipo(tipo) {

    const tipos = {

        SIMPLES: "Quarto simples",

        DUPLO: "Quarto duplo",

        SUITE: "Suíte"

    };


    return tipos[
        String(tipo).toUpperCase()
    ] || tipo || "Não informado";

}


function criarBadgeStatus(status) {

    const nomes = {

        RESERVADA: "Reservada",

        CHECKIN: "Check-in",

        FINALIZADA: "Finalizada",

        CANCELADA: "Cancelada"

    };


    const classe =
        String(status)
            .toLowerCase()
            .replace("checkin", "checkin");


    return `
        <span class="status status-${classe}">
            ${nomes[status] || status}
        </span>
    `;

}


/* =========================================================
   ALERTAS
========================================================= */

function mostrarAlerta(
    mensagem,
    tipo = "info"
) {

    const alertBox =
        document.getElementById(
            "alertBox"
        );


    alertBox.textContent =
        mensagem;


    alertBox.className =
        `alert ${tipo}`;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    setTimeout(() => {

        alertBox.classList.add(
            "hidden"
        );

    }, 5000);

}


/* =========================================================
   TRATAMENTO DE ERRO DA API
========================================================= */

async function obterErroResposta(
    resposta
) {

    try {

        const dados =
            await resposta.json();


        return (
            dados.message ||
            dados.mensagem ||
            dados.error ||
            "Erro ao processar a solicitação."
        );

    } catch {

        return (
            `Erro HTTP ${resposta.status}`
        );

    }

}


/* =========================================================
   SEGURANÇA
========================================================= */

function escaparHTML(texto) {

    return String(texto ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   LOGOUT
========================================================= */

document
    .getElementById("btnLogout")
    .addEventListener(
        "click",
        () => {

            /*
             * Se o auth.js do projeto possuir
             * auth.logout(), utilizamos ele.
             */

            if (
                typeof auth !== "undefined" &&
                typeof auth.logout === "function"
            ) {

                auth.logout();

                return;

            }


            /*
             * Fallback caso o auth.js ainda não
             * esteja carregado.
             */

            window.location.href =
                "login.html";

        }
    );