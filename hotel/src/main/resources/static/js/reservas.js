/* ============================================================
   HOTELWEB
   RESERVAS - SPRINT 4
============================================================ */


/* ============================================================
   VARIÁVEIS
============================================================ */

let reservas = [];
let hospedes = [];
let quartos = [];

let reservaSelecionada = null;


/* ============================================================
   INICIALIZAÇÃO
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    configurarEventos();

    definirDataMinima();

    carregarDados();

});


/* ============================================================
   EVENTOS
============================================================ */

function configurarEventos() {

    const btnNovaReserva =
        document.getElementById("btnNovaReserva");

    const btnFechar =
        document.getElementById("modalFechar");

    const btnCancelar =
        document.getElementById("btnCancelar");

    const form =
        document.getElementById("formReserva");

    const btnLimparFiltros =
        document.getElementById("btnLimparFiltros");

    const btnFecharDetalhes =
        document.getElementById("fecharDetalhes");

    const btnFecharDetalhes2 =
        document.getElementById("btnFecharDetalhes");

    const btnCancelarReserva =
        document.getElementById("btnCancelarReserva");


    if (btnNovaReserva) {
        btnNovaReserva.addEventListener(
            "click",
            abrirModalNovaReserva
        );
    }


    if (btnFechar) {
        btnFechar.addEventListener(
            "click",
            fecharModalReserva
        );
    }


    if (btnCancelar) {
        btnCancelar.addEventListener(
            "click",
            fecharModalReserva
        );
    }


    if (form) {
        form.addEventListener(
            "submit",
            salvarReserva
        );
    }


    if (btnLimparFiltros) {
        btnLimparFiltros.addEventListener(
            "click",
            limparFiltros
        );
    }


    if (btnFecharDetalhes) {
        btnFecharDetalhes.addEventListener(
            "click",
            fecharModalDetalhes
        );
    }


    if (btnFecharDetalhes2) {
        btnFecharDetalhes2.addEventListener(
            "click",
            fecharModalDetalhes
        );
    }


    if (btnCancelarReserva) {
        btnCancelarReserva.addEventListener(
            "click",
            cancelarReservaSelecionada
        );
    }


    const dataCheckin =
        document.getElementById("dataCheckin");

    const dataCheckout =
        document.getElementById("dataCheckout");

    const quarto =
        document.getElementById("quartoId");


    if (dataCheckin) {

        dataCheckin.addEventListener(
            "change",
            atualizarPreview
        );

    }


    if (dataCheckout) {

        dataCheckout.addEventListener(
            "change",
            atualizarPreview
        );

    }


    if (quarto) {

        quarto.addEventListener(
            "change",
            atualizarPreview
        );

    }


    /* ========================================================
       FILTROS AUTOMÁTICOS
    ======================================================== */

    const filtros = [
        "filtroHospede",
        "filtroQuarto",
        "filtroCheckin",
        "filtroCheckout",
        "filtroStatus"
    ];

    filtros.forEach(id => {

        const elemento =
            document.getElementById(id);

        if (!elemento) {
            return;
        }

        elemento.addEventListener(
            "input",
            aplicarFiltros
        );

        elemento.addEventListener(
            "change",
            aplicarFiltros
        );

    });


    /* ========================================================
       FECHAR MODAIS CLICANDO FORA
    ======================================================== */

    const modalReserva =
        document.getElementById("modalReserva");

    const modalDetalhes =
        document.getElementById("modalDetalhes");


    if (modalReserva) {

        modalReserva.addEventListener(
            "click",
            evento => {

                if (evento.target === modalReserva) {
                    fecharModalReserva();
                }

            }
        );

    }


    if (modalDetalhes) {

        modalDetalhes.addEventListener(
            "click",
            evento => {

                if (evento.target === modalDetalhes) {
                    fecharModalDetalhes();
                }

            }
        );

    }

}


/* ============================================================
   CARREGAR DADOS
============================================================ */

async function carregarDados() {

    try {

        await Promise.all([
            carregarHospedes(),
            carregarQuartos(),
            carregarReservas()
        ]);

    } catch (erro) {

        console.error(
            "Erro ao carregar dados:",
            erro
        );

        mostrarMensagem(
            "Não foi possível carregar os dados da tela.",
            "erro"
        );

    }

}


/* ============================================================
   CARREGAR HÓSPEDES
============================================================ */

async function carregarHospedes() {

    try {

        const resposta =
            await fetch("/api/hospedes");

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar hóspedes."
            );
        }

        hospedes =
            await resposta.json();

        preencherSelectHospedes();

    } catch (erro) {

        console.error(
            "Erro ao carregar hóspedes:",
            erro
        );

        const select =
            document.getElementById("hospedeId");

        if (select) {

            select.innerHTML = `
                <option value="">
                    Erro ao carregar hóspedes
                </option>
            `;

        }

    }

}


/* ============================================================
   SELECT DE HÓSPEDES
============================================================ */

function preencherSelectHospedes() {

    const select =
        document.getElementById("hospedeId");

    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Selecione o hóspede
        </option>
    `;


    hospedes.forEach(hospede => {

        const option =
            document.createElement("option");

        option.value =
            hospede.id;

        option.textContent =
            `${hospede.nome} - CPF ${hospede.cpf || ""}`;

        select.appendChild(option);

    });

}


/* ============================================================
   CARREGAR QUARTOS
============================================================ */

async function carregarQuartos() {

    try {

        const resposta =
            await fetch("/api/quartos");

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar quartos."
            );
        }

        quartos =
            await resposta.json();

        preencherSelectQuartos();

    } catch (erro) {

        console.error(
            "Erro ao carregar quartos:",
            erro
        );

    }

}


/* ============================================================
   SELECT DE QUARTOS
============================================================ */

function preencherSelectQuartos() {

    const select =
        document.getElementById("quartoId");

    if (!select) {
        return;
    }


    select.innerHTML = `
        <option value="">
            Selecione o quarto
        </option>
    `;


    /*
     * Pela regra do projeto:
     * quarto em MANUTENÇÃO não pode ser reservado.
     */

    const quartosDisponiveis =
        quartos.filter(quarto => {

            const status =
                normalizar(
                    quarto.statusOcupacao ||
                    quarto.status_ocupacao
                );

            return status !== "MANUTENCAO";

        });


    quartosDisponiveis.forEach(quarto => {

        const option =
            document.createElement("option");

        option.value =
            quarto.id;

        const numero =
            quarto.numero || "-";

        const tipo =
            formatarTipoQuarto(
                quarto.tipo
            );

        const valor =
            formatarMoeda(
                quarto.valorDiaria ??
                quarto.valor_diaria ??
                0
            );

        option.textContent =
            `Quarto ${numero} - ${tipo} - ${valor}/diária`;

        select.appendChild(option);

    });

}


/* ============================================================
   CARREGAR RESERVAS
============================================================ */

async function carregarReservas() {

    const tbody =
        document.getElementById(
            "lista-reservas"
        );

    try {

        const resposta =
            await fetch("/api/reservas");

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar reservas."
            );
        }

        reservas =
            await resposta.json();

        renderizarReservas(
            reservas
        );

        atualizarIndicadores(
            reservas
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar reservas:",
            erro
        );


        if (tbody) {

            tbody.innerHTML = `
                <tr>
                    <td
                        colspan="6"
                        class="empty-message">

                        <i class="fa-solid fa-circle-exclamation"></i>

                        Não foi possível carregar as reservas.

                    </td>
                </tr>
            `;

        }

    }

}


/* ============================================================
   RENDERIZAR RESERVAS
============================================================ */

function renderizarReservas(lista) {

    const tbody =
        document.getElementById(
            "lista-reservas"
        );

    if (!tbody) {
        return;
    }


    if (!lista || lista.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="6"
                    class="empty-message">

                    <i class="fa-solid fa-calendar-xmark"></i>

                    Nenhuma reserva encontrada.

                </td>
            </tr>
        `;

        atualizarContador(0);

        return;
    }


    tbody.innerHTML = "";


    lista.forEach(reserva => {

        const hospede =
            encontrarHospede(
                reserva.hospedeId ??
                reserva.hospede_id ??
                reserva.hospede?.id
            );


        const quarto =
            encontrarQuarto(
                reserva.quartoId ??
                reserva.quarto_id ??
                reserva.quarto?.id
            );


        /*
         * O Back-End pode devolver:
         * hospede/quarto como objetos
         * ou apenas os IDs.
         */

        const nomeHospede =
            reserva.hospede?.nome ||
            hospede?.nome ||
            "Hóspede não encontrado";


        const cpfHospede =
            reserva.hospede?.cpf ||
            hospede?.cpf ||
            "";


        const numeroQuarto =
            reserva.quarto?.numero ||
            quarto?.numero ||
            "-";


        const checkin =
            reserva.dataCheckinPrevista ||
            reserva.data_checkin_prevista;


        const checkout =
            reserva.dataCheckoutPrevista ||
            reserva.data_checkout_prevista;


        const status =
            normalizar(
                reserva.status
            );


        const tr =
            document.createElement("tr");


        tr.innerHTML = `

            <td>

                <div class="hospede-cell">

                    <div class="hospede-avatar">

                        ${obterIniciais(nomeHospede)}

                    </div>

                    <div class="hospede-info">

                        <strong>
                            ${escaparHTML(nomeHospede)}
                        </strong>

                        <span>
                            ${escaparHTML(cpfHospede)}
                        </span>

                    </div>

                </div>

            </td>


            <td>

                <div class="quarto-cell">

                    <i class="fa-solid fa-bed"></i>

                    <strong>
                        ${escaparHTML(
            String(numeroQuarto)
        )}
                    </strong>

                </div>

            </td>


            <td>
                ${formatarData(checkin)}
            </td>


            <td>
                ${formatarData(checkout)}
            </td>


            <td>

                <span class="
                    status-badge
                    ${classeStatus(status)}
                ">

                    ${textoStatus(status)}

                </span>

            </td>


            <td>

                <div class="action-buttons">

                    <button
                        type="button"
                        class="btn-view"
                        title="Ver detalhes"
                        data-id="${reserva.id}">

                        <i class="fa-solid fa-eye"></i>

                    </button>


                    ${status === "RESERVADA"
                ? `
                            <button
                                type="button"
                                class="btn-delete"
                                title="Cancelar reserva"
                                data-id="${reserva.id}">

                                <i class="fa-solid fa-ban"></i>

                            </button>
                        `
                : ""
            }

                </div>

            </td>

        `;


        /* ========================================================
           BOTÃO DETALHES
        ======================================================== */

        const btnView =
            tr.querySelector(
                ".btn-view"
            );

        if (btnView) {

            btnView.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            btnView.dataset.id
                        );

                    abrirDetalhes(id);

                }
            );

        }


        /* ========================================================
           BOTÃO CANCELAR
        ======================================================== */

        const btnDelete =
            tr.querySelector(
                ".btn-delete"
            );

        if (btnDelete) {

            btnDelete.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            btnDelete.dataset.id
                        );

                    cancelarReserva(id);

                }
            );

        }


        tbody.appendChild(tr);

    });


    atualizarContador(
        lista.length
    );

}


/* ============================================================
   SALVAR RESERVA
============================================================ */

async function salvarReserva(evento) {

    evento.preventDefault();


    const hospedeId =
        document.getElementById(
            "hospedeId"
        ).value;


    const quartoId =
        document.getElementById(
            "quartoId"
        ).value;


    const dataCheckin =
        document.getElementById(
            "dataCheckin"
        ).value;


    const dataCheckout =
        document.getElementById(
            "dataCheckout"
        ).value;


    /* ========================================================
       VALIDAÇÕES
    ======================================================== */

    if (!hospedeId) {

        mostrarMensagem(
            "Selecione um hóspede.",
            "erro"
        );

        return;
    }


    if (!quartoId) {

        mostrarMensagem(
            "Selecione um quarto.",
            "erro"
        );

        return;
    }


    if (!dataCheckin || !dataCheckout) {

        mostrarMensagem(
            "Informe as datas de check-in e check-out.",
            "erro"
        );

        return;
    }


    const entrada =
        converterData(dataCheckin);

    const saida =
        converterData(dataCheckout);


    if (saida <= entrada) {

        mostrarMensagem(
            "A data de check-out deve ser posterior ao check-in.",
            "erro"
        );

        return;
    }


    /*
     * Verificação local apenas para melhorar
     * a experiência do usuário.
     *
     * A validação definitiva deve ser feita
     * pelo Back-End.
     */

    if (
        existeConflitoLocal(
            Number(quartoId),
            dataCheckin,
            dataCheckout
        )
    ) {

        mostrarMensagem(
            "Este quarto já possui uma reserva para esse período.",
            "erro"
        );

        return;
    }


    const dados = {

        hospedeId:
            Number(hospedeId),

        quartoId:
            Number(quartoId),

        dataCheckinPrevista:
            dataCheckin,

        dataCheckoutPrevista:
            dataCheckout

    };


    const botao =
        document.getElementById(
            "btnSalvarReserva"
        );


    const textoOriginal =
        botao
            ? botao.innerHTML
            : "";


    if (botao) {

        botao.disabled = true;

        botao.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Salvando...
        `;

    }


    try {

        const resposta =
            await fetch(
                "/api/reservas",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(dados)
                }
            );


        /*
         * O Back-End deve retornar
         * 201 Created em criação válida.
         */

        if (!resposta.ok) {

            let mensagem =
                "Não foi possível criar a reserva.";


            try {

                const erro =
                    await resposta.json();

                mensagem =
                    erro.message ||
                    erro.mensagem ||
                    mensagem;

            } catch (_) {
                // Resposta sem JSON.
            }


            throw new Error(
                mensagem
            );

        }


        mostrarMensagem(
            "Reserva criada com sucesso!",
            "sucesso"
        );


        fecharModalReserva();


        await carregarReservas();


    } catch (erro) {

        console.error(
            "Erro ao criar reserva:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Erro ao criar reserva.",
            "erro"
        );


    } finally {

        if (botao) {

            botao.disabled = false;

            botao.innerHTML =
                textoOriginal;

        }

    }

}


/* ============================================================
   CANCELAR RESERVA
============================================================ */

async function cancelarReserva(id) {

    const reserva =
        reservas.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!reserva) {

        mostrarMensagem(
            "Reserva não encontrada.",
            "erro"
        );

        return;
    }


    const status =
        normalizar(
            reserva.status
        );


    if (status !== "RESERVADA") {

        mostrarMensagem(
            "Somente reservas com status RESERVADA podem ser canceladas.",
            "erro"
        );

        return;
    }


    const confirmar =
        confirm(
            "Deseja realmente cancelar esta reserva?"
        );


    if (!confirmar) {
        return;
    }


    try {

        const resposta =
            await fetch(
                `/api/reservas/${id}/cancelar`,
                {
                    method: "POST"
                }
            );


        if (!resposta.ok) {

            let mensagem =
                "Não foi possível cancelar a reserva.";


            try {

                const erro =
                    await resposta.json();

                mensagem =
                    erro.message ||
                    erro.mensagem ||
                    mensagem;

            } catch (_) { }


            throw new Error(
                mensagem
            );

        }


        mostrarMensagem(
            "Reserva cancelada com sucesso.",
            "sucesso"
        );


        fecharModalDetalhes();


        await carregarReservas();


    } catch (erro) {

        console.error(
            "Erro ao cancelar reserva:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Erro ao cancelar reserva.",
            "erro"
        );

    }

}


/* ============================================================
   CANCELAR PELO MODAL
============================================================ */

function cancelarReservaSelecionada() {

    if (!reservaSelecionada) {
        return;
    }


    cancelarReserva(
        reservaSelecionada.id
    );

}


/* ============================================================
   ABRIR MODAL DE NOVA RESERVA
============================================================ */

function abrirModalNovaReserva() {

    const modal =
        document.getElementById(
            "modalReserva"
        );

    const form =
        document.getElementById(
            "formReserva"
        );


    if (form) {
        form.reset();
    }


    document.getElementById(
        "modalTitulo"
    ).textContent =
        "Nova Reserva";


    document.getElementById(
        "reservaId"
    ).value = "";


    const mensagem =
        document.getElementById(
            "mensagemDisponibilidade"
        );


    if (mensagem) {

        mensagem.innerHTML = `
            <i class="fa-solid fa-circle-info"></i>

            Selecione o quarto e as datas para verificar
            a disponibilidade.
        `;

        mensagem.style.background =
            "#eff6ff";

        mensagem.style.color =
            "#1d4ed8";

        mensagem.style.borderColor =
            "#bfdbfe";

    }


    atualizarPreview();


    if (modal) {
        modal.classList.add("active");
    }

}


/* ============================================================
   FECHAR MODAL DE RESERVA
============================================================ */

function fecharModalReserva() {

    const modal =
        document.getElementById(
            "modalReserva"
        );


    if (modal) {
        modal.classList.remove(
            "active"
        );
    }

}


/* ============================================================
   ABRIR DETALHES
============================================================ */

function abrirDetalhes(id) {

    const reserva =
        reservas.find(
            item =>
                Number(item.id) === Number(id)
        );


    if (!reserva) {
        return;
    }


    reservaSelecionada =
        reserva;


    const hospede =
        encontrarHospede(
            reserva.hospedeId ??
            reserva.hospede_id ??
            reserva.hospede?.id
        );


    const quarto =
        encontrarQuarto(
            reserva.quartoId ??
            reserva.quarto_id ??
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


    document.getElementById(
        "detalheId"
    ).textContent =
        `#${reserva.id}`;


    document.getElementById(
        "detalheStatus"
    ).innerHTML = `
        <span class="
            status-badge
            ${classeStatus(
        normalizar(reserva.status)
    )}
        ">
            ${textoStatus(
        normalizar(reserva.status)
    )}
        </span>
    `;


    document.getElementById(
        "detalheHospede"
    ).textContent =
        nomeHospede;


    document.getElementById(
        "detalheQuarto"
    ).textContent =
        `Quarto ${numeroQuarto}`;


    document.getElementById(
        "detalheCheckin"
    ).textContent =
        formatarData(checkin);


    document.getElementById(
        "detalheCheckout"
    ).textContent =
        formatarData(checkout);


    const btnCancelar =
        document.getElementById(
            "btnCancelarReserva"
        );


    if (btnCancelar) {

        const status =
            normalizar(
                reserva.status
            );


        btnCancelar.style.display =
            status === "RESERVADA"
                ? "block"
                : "none";

    }


    const modal =
        document.getElementById(
            "modalDetalhes"
        );


    if (modal) {
        modal.classList.add(
            "active"
        );
    }

}


/* ============================================================
   FECHAR DETALHES
============================================================ */

function fecharModalDetalhes() {

    const modal =
        document.getElementById(
            "modalDetalhes"
        );


    if (modal) {

        modal.classList.remove(
            "active"
        );

    }


    reservaSelecionada =
        null;

}


/* ============================================================
   PREVIEW DA RESERVA
============================================================ */

function atualizarPreview() {

    const quartoId =
        document.getElementById(
            "quartoId"
        ).value;


    const checkin =
        document.getElementById(
            "dataCheckin"
        ).value;


    const checkout =
        document.getElementById(
            "dataCheckout"
        ).value;


    const quarto =
        encontrarQuarto(
            Number(quartoId)
        );


    const previewQuarto =
        document.getElementById(
            "previewQuarto"
        );


    const previewDiarias =
        document.getElementById(
            "previewDiarias"
        );


    const previewValor =
        document.getElementById(
            "previewValor"
        );


    if (quarto) {

        const tipo =
            formatarTipoQuarto(
                quarto.tipo
            );


        previewQuarto.textContent =
            `Quarto ${quarto.numero} • ${tipo}`;

    } else {

        previewQuarto.textContent =
            "Selecione um quarto";

    }


    const diarias =
        calcularDiarias(
            checkin,
            checkout
        );


    previewDiarias.textContent =
        diarias;


    const valorDiaria =
        quarto
            ? Number(
                quarto.valorDiaria ??
                quarto.valor_diaria ??
                0
            )
            : 0;


    const valorTotal =
        diarias * valorDiaria;


    previewValor.textContent =
        formatarMoeda(
            valorTotal
        );


    atualizarMensagemDisponibilidade(
        quarto,
        checkin,
        checkout
    );

}


/* ============================================================
   DISPONIBILIDADE
============================================================ */

function atualizarMensagemDisponibilidade(
    quarto,
    checkin,
    checkout
) {

    const elemento =
        document.getElementById(
            "mensagemDisponibilidade"
        );


    if (!elemento) {
        return;
    }


    if (!quarto || !checkin || !checkout) {

        elemento.innerHTML = `
            <i class="fa-solid fa-circle-info"></i>

            Selecione o quarto e as datas para verificar
            a disponibilidade.
        `;

        elemento.style.background =
            "#eff6ff";

        elemento.style.color =
            "#1d4ed8";

        elemento.style.borderColor =
            "#bfdbfe";

        return;
    }


    const entrada =
        converterData(checkin);

    const saida =
        converterData(checkout);


    if (saida <= entrada) {

        elemento.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation"></i>

            A data de check-out deve ser posterior
            ao check-in.
        `;

        elemento.style.background =
            "#fee2e2";

        elemento.style.color =
            "#b91c1c";

        elemento.style.borderColor =
            "#fecaca";

        return;
    }


    const conflito =
        existeConflitoLocal(
            quarto.id,
            checkin,
            checkout
        );


    if (conflito) {

        elemento.innerHTML = `
            <i class="fa-solid fa-circle-xmark"></i>

            Este quarto possui uma reserva conflitante
            para o período selecionado.
        `;

        elemento.style.background =
            "#fee2e2";

        elemento.style.color =
            "#b91c1c";

        elemento.style.borderColor =
            "#fecaca";

        return;
    }


    elemento.innerHTML = `
        <i class="fa-solid fa-circle-check"></i>

        Quarto aparentemente disponível para o
        período selecionado.
    `;

    elemento.style.background =
        "#dcfce7";

    elemento.style.color =
        "#166534";

    elemento.style.borderColor =
        "#bbf7d0";

}


/* ============================================================
   VERIFICAR CONFLITO LOCAL
============================================================ */

function existeConflitoLocal(
    quartoId,
    dataCheckin,
    dataCheckout
) {

    const novaEntrada =
        converterData(dataCheckin);

    const novaSaida =
        converterData(dataCheckout);


    return reservas.some(reserva => {

        const reservaQuartoId =
            Number(
                reserva.quartoId ??
                reserva.quarto_id ??
                reserva.quarto?.id
            );


        if (
            reservaQuartoId !==
            Number(quartoId)
        ) {
            return false;
        }


        const status =
            normalizar(
                reserva.status
            );


        /*
         * Reservas canceladas e finalizadas
         * não bloqueiam o período.
         */

        if (
            status === "CANCELADA" ||
            status === "FINALIZADA"
        ) {
            return false;
        }


        const entradaExistente =
            reserva.dataCheckinPrevista ||
            reserva.data_checkin_prevista;


        const saidaExistente =
            reserva.dataCheckoutPrevista ||
            reserva.data_checkout_prevista;


        if (
            !entradaExistente ||
            !saidaExistente
        ) {
            return false;
        }


        const entrada =
            converterData(
                entradaExistente
            );

        const saida =
            converterData(
                saidaExistente
            );


        /*
         * Existe conflito quando:
         *
         * nova entrada < saída existente
         * E
         * nova saída > entrada existente
         */

        return (
            novaEntrada < saida &&
            novaSaida > entrada
        );

    });

}


/* ============================================================
   FILTROS
============================================================ */

function aplicarFiltros() {

    const nome =
        normalizar(
            document.getElementById(
                "filtroHospede"
            ).value
        );


    const quartoFiltro =
        normalizar(
            document.getElementById(
                "filtroQuarto"
            ).value
        );


    const checkinFiltro =
        document.getElementById(
            "filtroCheckin"
        ).value;


    const checkoutFiltro =
        document.getElementById(
            "filtroCheckout"
        ).value;


    const statusFiltro =
        normalizar(
            document.getElementById(
                "filtroStatus"
            ).value
        );


    const resultado =
        reservas.filter(
            reserva => {

                const hospede =
                    encontrarHospede(
                        reserva.hospedeId ??
                        reserva.hospede_id ??
                        reserva.hospede?.id
                    );


                const quarto =
                    encontrarQuarto(
                        reserva.quartoId ??
                        reserva.quarto_id ??
                        reserva.quarto?.id
                    );


                const nomeHospede =
                    normalizar(
                        reserva.hospede?.nome ||
                        hospede?.nome ||
                        ""
                    );


                const cpfHospede =
                    normalizar(
                        reserva.hospede?.cpf ||
                        hospede?.cpf ||
                        ""
                    );


                const numeroQuarto =
                    normalizar(
                        reserva.quarto?.numero ||
                        quarto?.numero ||
                        ""
                    );


                const status =
                    normalizar(
                        reserva.status
                    );


                const dataEntrada =
                    reserva.dataCheckinPrevista ||
                    reserva.data_checkin_prevista;


                const dataSaida =
                    reserva.dataCheckoutPrevista ||
                    reserva.data_checkout_prevista;


                /* HÓSPEDE */

                if (
                    nome &&
                    !nomeHospede.includes(nome) &&
                    !cpfHospede.includes(nome)
                ) {

                    return false;

                }


                /* QUARTO */

                if (
                    quartoFiltro &&
                    !numeroQuarto.includes(
                        quartoFiltro
                    )
                ) {

                    return false;

                }


                /* STATUS */

                if (
                    statusFiltro &&
                    status !== statusFiltro
                ) {

                    return false;

                }


                /* DATA CHECK-IN */

                if (
                    checkinFiltro &&
                    dataEntrada < checkinFiltro
                ) {

                    return false;

                }


                /* DATA CHECK-OUT */

                if (
                    checkoutFiltro &&
                    dataSaida > checkoutFiltro
                ) {

                    return false;

                }


                return true;

            }
        );


    renderizarReservas(
        resultado
    );

}


/* ============================================================
   LIMPAR FILTROS
============================================================ */

function limparFiltros() {

    const campos = [
        "filtroHospede",
        "filtroQuarto",
        "filtroCheckin",
        "filtroCheckout"
    ];


    campos.forEach(id => {

        const elemento =
            document.getElementById(id);

        if (elemento) {
            elemento.value = "";
        }

    });


    const status =
        document.getElementById(
            "filtroStatus"
        );


    if (status) {
        status.value = "";
    }


    renderizarReservas(
        reservas
    );

}


/* ============================================================
   INDICADORES
============================================================ */

function atualizarIndicadores(lista) {

    const reservadas =
        lista.filter(
            reserva =>
                normalizar(
                    reserva.status
                ) === "RESERVADA"
        ).length;


    const checkin =
        lista.filter(
            reserva =>
                normalizar(
                    reserva.status
                ) === "CHECKIN"
        ).length;


    const canceladas =
        lista.filter(
            reserva =>
                normalizar(
                    reserva.status
                ) === "CANCELADA"
        ).length;


    /*
     * Próximas = reservas RESERVADA
     * cujo check-in ainda não ocorreu.
     */

    const hoje =
        formatarDataISO(
            new Date()
        );


    const proximas =
        lista.filter(
            reserva => {

                const status =
                    normalizar(
                        reserva.status
                    );


                const data =
                    reserva.dataCheckinPrevista ||
                    reserva.data_checkin_prevista;


                return (
                    status === "RESERVADA" &&
                    data >= hoje
                );

            }
        ).length;


    document.getElementById(
        "totalReservadas"
    ).textContent =
        reservadas;


    document.getElementById(
        "totalCheckin"
    ).textContent =
        checkin;


    document.getElementById(
        "totalProximas"
    ).textContent =
        proximas;


    document.getElementById(
        "totalCanceladas"
    ).textContent =
        canceladas;

}


/* ============================================================
   CONTADOR
============================================================ */

function atualizarContador(total) {

    const elemento =
        document.getElementById(
            "contadorReservas"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        `${total} ${total === 1
            ? "reserva"
            : "reservas"
        }`;

}


/* ============================================================
   FUNÇÕES AUXILIARES
============================================================ */

function encontrarHospede(id) {

    if (!id) {
        return null;
    }


    return hospedes.find(
        hospede =>
            Number(hospede.id) ===
            Number(id)
    ) || null;

}


function encontrarQuarto(id) {

    if (!id) {
        return null;
    }


    return quartos.find(
        quarto =>
            Number(quarto.id) ===
            Number(id)
    ) || null;

}


/* ============================================================
   DATAS
============================================================ */

function converterData(data) {

    if (!data) {
        return null;
    }


    const partes =
        String(data).split("-");


    if (partes.length === 3) {

        return new Date(
            Number(partes[0]),
            Number(partes[1]) - 1,
            Number(partes[2])
        );

    }


    return new Date(data);

}


function calcularDiarias(
    checkin,
    checkout
) {

    if (!checkin || !checkout) {
        return 0;
    }


    const entrada =
        converterData(checkin);

    const saida =
        converterData(checkout);


    const diferenca =
        saida - entrada;


    const dias =
        diferenca /
        (1000 * 60 * 60 * 24);


    return dias > 0
        ? dias
        : 0;

}


function formatarData(data) {

    if (!data) {
        return "-";
    }


    const partes =
        String(data).split("-");


    if (partes.length === 3) {

        return `${partes[2]}/${partes[1]}/${partes[0]}`;

    }


    return data;

}


function formatarDataISO(data) {

    const ano =
        data.getFullYear();


    const mes =
        String(
            data.getMonth() + 1
        ).padStart(2, "0");


    const dia =
        String(
            data.getDate()
        ).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;

}


function definirDataMinima() {

    const hoje =
        formatarDataISO(
            new Date()
        );


    const checkin =
        document.getElementById(
            "dataCheckin"
        );


    const checkout =
        document.getElementById(
            "dataCheckout"
        );


    if (checkin) {
        checkin.min = hoje;
    }


    if (checkout) {
        checkout.min = hoje;
    }

}


/* ============================================================
   MOEDA
============================================================ */

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


/* ============================================================
   STATUS
============================================================ */

function normalizar(valor) {

    return String(
        valor || ""
    )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toUpperCase()
        .trim();

}


function textoStatus(status) {

    switch (status) {

        case "RESERVADA":
            return "Reservada";

        case "CHECKIN":
            return "Check-in";

        case "FINALIZADA":
            return "Finalizada";

        case "CANCELADA":
            return "Cancelada";

        default:
            return status || "Desconhecido";

    }

}


function classeStatus(status) {

    switch (status) {

        case "RESERVADA":
            return "status-reservada";

        case "CHECKIN":
            return "status-checkin";

        case "FINALIZADA":
            return "status-finalizada";

        case "CANCELADA":
            return "status-cancelada";

        default:
            return "";

    }

}


/* ============================================================
   TIPO DE QUARTO
============================================================ */

function formatarTipoQuarto(tipo) {

    const valor =
        normalizar(tipo);


    switch (valor) {

        case "SIMPLES":
            return "Simples";

        case "DUPLO":
            return "Duplo";

        case "SUITE":
            return "Suíte";

        default:
            return tipo || "Quarto";

    }

}


/* ============================================================
   INICIAIS
============================================================ */

function obterIniciais(nome) {

    if (!nome) {
        return "??";
    }


    const partes =
        nome
            .trim()
            .split(/\s+/);


    if (partes.length === 1) {

        return partes[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        partes[0][0] +
        partes[partes.length - 1][0]
    ).toUpperCase();

}


/* ============================================================
   SEGURANÇA HTML
============================================================ */

function escaparHTML(valor) {

    return String(valor ?? "")
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   MENSAGENS
============================================================ */

function mostrarMensagem(
    mensagem,
    tipo
) {

    /*
     * Caso o app.js/style.js do projeto
     * possua um sistema próprio de alertas,
     * ele pode substituir esta função.
     */

    if (tipo === "sucesso") {

        console.log(
            "SUCESSO:",
            mensagem
        );

        alert(
            mensagem
        );

    } else {

        console.error(
            "ERRO:",
            mensagem
        );

        alert(
            mensagem
        );

    }

}


/* ============================================================
   LOGOUT
============================================================ */

function fazerLogout() {

    /*
     * O projeto já utiliza menu/auth.
     * Caso auth.js esteja disponível,
     * utiliza o logout existente.
     */

    if (
        typeof auth !== "undefined" &&
        typeof auth.logout === "function"
    ) {

        auth.logout();

        return;

    }


    /*
     * Fallback.
     */

    window.location.href =
        "login.html";

}