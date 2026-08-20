// ============================================================
// RECEPÇÃO - Reservas, Check-in e Check-out
// ============================================================

let reservas = [];


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    verificarAutenticacao();

    carregarDadosUsuario();

    carregarReservas();

    configurarFiltros();

});


// ============================================================
// AUTENTICAÇÃO
// ============================================================

function verificarAutenticacao() {

    const usuarioLogado = localStorage.getItem("usuarioLogado");

    if (!usuarioLogado) {
        window.location.href = "login.html";
    }

}


// ============================================================
// USUÁRIO
// ============================================================

function carregarDadosUsuario() {

    const usuarioStr = localStorage.getItem("usuarioLogado");

    if (!usuarioStr) return;

    try {

        const usuario = JSON.parse(usuarioStr);

        const nomeEl = document.getElementById("usuario-nome");
        const papelEl = document.getElementById("usuario-papel");
        const avatarEl = document.getElementById("avatar-inicial");

        if (nomeEl) {
            nomeEl.textContent = usuario.nome || "Colaborador";
        }

        if (papelEl) {

            const papel = usuario.papel || "FUNCIONARIO";

            papelEl.textContent = papel;

            papelEl.className =
                `badge ${papel.toLowerCase()}`;

        }

        if (avatarEl && usuario.nome) {

            const iniciais = usuario.nome
                .split(" ")
                .map(nome => nome[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

            avatarEl.textContent = iniciais;

        }

        if (typeof aplicarRegrasMenu === "function") {
            aplicarRegrasMenu(usuario.papel);
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar usuário:",
            erro
        );

        fazerLogout();

    }

}


// ============================================================
// LOGOUT
// ============================================================

function fazerLogout() {

    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("token");

    window.location.href = "login.html";

}


// ============================================================
// CARREGAR RESERVAS
// ============================================================

async function carregarReservas() {

    const tabela =
        document.getElementById("listaReservas");

    tabela.innerHTML = `
        <tr>
            <td colspan="7" class="carregando">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Carregando reservas...
            </td>
        </tr>
    `;

    try {

        reservas = await apiRequest("/reservas");

        if (!Array.isArray(reservas)) {
            reservas = [];
        }

        atualizarIndicadores();

        renderizarReservas();

    } catch (erro) {

        console.error(
            "Erro ao carregar reservas:",
            erro
        );

        tabela.innerHTML = `
            <tr>
                <td colspan="7" class="carregando">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    Não foi possível carregar as reservas.
                </td>
            </tr>
        `;

        mostrarMensagem(
            "Não foi possível conectar ao servidor.",
            "erro"
        );

    }

}


// ============================================================
// INDICADORES
// ============================================================

function atualizarIndicadores() {

    const total =
        reservas.length;

    const pendentes =
        reservas.filter(
            reserva => reserva.status === "RESERVADA"
        ).length;

    const hospedados =
        reservas.filter(
            reserva => reserva.status === "CHECKIN"
        ).length;

    const checkouts =
        reservas.filter(
            reserva => reserva.status === "FINALIZADA"
        ).length;


    document.getElementById("total-reservas").textContent =
        total;

    document.getElementById("total-pendentes").textContent =
        pendentes;

    document.getElementById("total-hospedados").textContent =
        hospedados;

    document.getElementById("total-checkouts").textContent =
        checkouts;

}


// ============================================================
// RENDERIZAR RESERVAS
// ============================================================

function renderizarReservas() {

    const tabela =
        document.getElementById("listaReservas");

    const busca =
        document
            .getElementById("campoBusca")
            .value
            .toLowerCase()
            .trim();

    const filtroStatus =
        document.getElementById("filtroStatus").value;


    let lista =
        reservas.filter(reserva => {

            // FILTRO DE STATUS

            if (
                filtroStatus &&
                reserva.status !== filtroStatus
            ) {
                return false;
            }


            // BUSCA

            if (!busca) {
                return true;
            }


            const nome =
                reserva.hospede?.nome
                    ?.toLowerCase() || "";

            const cpf =
                reserva.hospede?.cpf
                    ?.toLowerCase() || "";

            const quarto =
                reserva.quarto?.numero
                    ?.toLowerCase() || "";

            const id =
                String(reserva.id);


            return (
                nome.includes(busca) ||
                cpf.includes(busca) ||
                quarto.includes(busca) ||
                id.includes(busca)
            );

        });


    if (lista.length === 0) {

        tabela.innerHTML = `
            <tr>
                <td colspan="7" class="carregando">
                    Nenhuma reserva encontrada.
                </td>
            </tr>
        `;

        return;

    }


    tabela.innerHTML =
        lista.map(criarLinhaReserva).join("");

}


// ============================================================
// CRIAR LINHA
// ============================================================

function criarLinhaReserva(reserva) {

    const hospede =
        reserva.hospede?.nome ||
        "Hóspede não informado";

    const quarto =
        reserva.quarto?.numero ||
        "-";

    const entrada =
        formatarData(reserva.dataCheckinPrevista);

    const saida =
        formatarData(reserva.dataCheckoutPrevista);

    const status =
        reserva.status || "-";


    return `
        <tr>

            <td>
                <strong>
                    #${reserva.id}
                </strong>
            </td>

            <td>
                ${hospede}
            </td>

            <td>
                <strong>
                    ${quarto}
                </strong>
            </td>

            <td>
                ${entrada}
            </td>

            <td>
                ${saida}
            </td>

            <td>
                ${criarStatus(status)}
            </td>

            <td>

                <div class="acoes">

                    <button
                        class="btn-acao btn-detalhes"
                        onclick="mostrarDetalhes(${reserva.id})">

                        <i class="fa-solid fa-eye"></i>
                        Detalhes

                    </button>

                    ${criarBotoesAcao(reserva)}

                </div>

            </td>

        </tr>
    `;

}


// ============================================================
// STATUS
// ============================================================

function criarStatus(status) {

    const nomes = {

        RESERVADA: "Reservada",

        CHECKIN: "Hospedado",

        FINALIZADA: "Finalizada",

        CANCELADA: "Cancelada"

    };

    const nome =
        nomes[status] || status;


    return `
        <span class="status-badge status-${status.toLowerCase()}">
            ${nome}
        </span>
    `;

}


// ============================================================
// BOTÕES
// ============================================================

function criarBotoesAcao(reserva) {

    if (reserva.status === "RESERVADA") {

        return `

            <button
                class="btn-acao btn-checkin"
                onclick="realizarCheckin(${reserva.id})">

                <i class="fa-solid fa-right-to-bracket"></i>
                Check-in

            </button>

            <button
                class="btn-acao btn-cancelar"
                onclick="cancelarReserva(${reserva.id})">

                <i class="fa-solid fa-ban"></i>
                Cancelar

            </button>

        `;

    }


    if (reserva.status === "CHECKIN") {

        return `

            <button
                class="btn-acao btn-checkout"
                onclick="realizarCheckout(${reserva.id})">

                <i class="fa-solid fa-right-from-bracket"></i>
                Check-out

            </button>

        `;

    }


    return "";

}


// ============================================================
// CHECK-IN
// ============================================================

async function realizarCheckin(id) {

    const confirmar =
        confirm(
            `Deseja realizar o check-in da reserva #${id}?`
        );

    if (!confirmar) return;


    try {

        await apiRequest(
            `/reservas/${id}/checkin`,
            "POST"
        );


        mostrarMensagem(
            "Check-in realizado com sucesso!",
            "sucesso"
        );


        await carregarReservas();


    } catch (erro) {

        console.error(
            "Erro no check-in:",
            erro
        );

        mostrarMensagem(
            erro.message ||
            "Não foi possível realizar o check-in.",
            "erro"
        );

    }

}


// ============================================================
// CHECK-OUT
// ============================================================

async function realizarCheckout(id) {

    const confirmar =
        confirm(
            `Deseja realizar o check-out da reserva #${id}?`
        );

    if (!confirmar) return;


    try {

        await apiRequest(
            `/reservas/${id}/checkout`,
            "POST"
        );


        mostrarMensagem(
            "Check-out realizado com sucesso!",
            "sucesso"
        );


        await carregarReservas();


    } catch (erro) {

        console.error(
            "Erro no check-out:",
            erro
        );

        mostrarMensagem(
            erro.message ||
            "Não foi possível realizar o check-out.",
            "erro"
        );

    }

}


// ============================================================
// CANCELAR
// ============================================================

async function cancelarReserva(id) {

    const confirmar =
        confirm(
            `Deseja cancelar a reserva #${id}?`
        );

    if (!confirmar) return;


    try {

        await apiRequest(
            `/reservas/${id}/cancelar`,
            "PATCH"
        );


        mostrarMensagem(
            "Reserva cancelada com sucesso!",
            "sucesso"
        );


        await carregarReservas();


    } catch (erro) {

        console.error(
            "Erro ao cancelar:",
            erro
        );

        mostrarMensagem(
            erro.message ||
            "Não foi possível cancelar a reserva.",
            "erro"
        );

    }

}


// ============================================================
// DETALHES
// ============================================================

function mostrarDetalhes(id) {

    const reserva =
        reservas.find(
            item => item.id === id
        );

    if (!reserva) return;


    const hospede =
        reserva.hospede || {};

    const quarto =
        reserva.quarto || {};


    document.getElementById(
        "detalhesReserva"
    ).innerHTML = `

        <div class="detalhes-grid">

            <div class="detalhe-item">

                <small>
                    Reserva
                </small>

                <strong>
                    #${reserva.id}
                </strong>

            </div>


            <div class="detalhe-item">

                <small>
                    Status
                </small>

                <strong>
                    ${criarStatus(reserva.status)}
                </strong>

            </div>


            <div class="detalhe-item">

                <small>
                    Hóspede
                </small>

                <strong>
                    ${hospede.nome || "-"}
                </strong>

            </div>


            <div class="detalhe-item">

                <small>
                    CPF
                </small>

                <strong>
                    ${hospede.cpf || "-"}
                </strong>

            </div>


            <div class="detalhe-item">

                <small>
                    Quarto
                </small>

                <strong>
                    ${quarto.numero || "-"}
                </strong>

            </div>


            <div class="detalhe-item">

                <small>
                    Tipo
                </small>

                <strong>
                    ${quarto.tipo || "-"}
                </strong>

            </div>


            <div class="detalhe-item">

                <small>
                    Check-in previsto
                </small>

                <strong>
                    ${formatarData(
                        reserva.dataCheckinPrevista
                    )}
                </strong>

            </div>


            <div class="detalhe-item">

                <small>
                    Check-out previsto
                </small>

                <strong>
                    ${formatarData(
                        reserva.dataCheckoutPrevista
                    )}
                </strong>

            </div>

        </div>

    `;


    document
        .getElementById("modalDetalhes")
        .classList.add("aberto");

}


// ============================================================
// FECHAR MODAL
// ============================================================

function fecharModal() {

    document
        .getElementById("modalDetalhes")
        .classList.remove("aberto");

}


// ============================================================
// FORMATAR DATA
// ============================================================

function formatarData(data) {

    if (!data) return "-";

    const partes =
        data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// ============================================================
// FILTROS
// ============================================================

function configurarFiltros() {

    const busca =
        document.getElementById("campoBusca");

    const status =
        document.getElementById("filtroStatus");


    busca.addEventListener(
        "input",
        renderizarReservas
    );

    status.addEventListener(
        "change",
        renderizarReservas
    );

}


// ============================================================
// MENSAGEM
// ============================================================

function mostrarMensagem(texto, tipo) {

    const elemento =
        document.getElementById("mensagem");

    elemento.textContent =
        texto;

    elemento.className =
        `mensagem visivel ${tipo}`;


    setTimeout(() => {

        elemento.className =
            "mensagem";

    }, 4000);

}