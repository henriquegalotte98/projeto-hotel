// ============================================================
// RECEPÇÃO - Reservas, Check-in e Check-out
// ============================================================

let reservas = [];
// Guarda a reserva que está sendo conferida no modal de check-out.
let reservaCheckoutId = null;


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    verificarAutenticacao();

    carregarDadosUsuario();

    carregarReservas();

    configurarFiltros();

    configurarModalDetalhes();

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
    try {
        // O resumo financeiro é calculado no back-end para evitar valores
        // diferentes entre a interface e a regra de cobrança.
        const reserva = reservas.find(item => Number(item.id) === Number(id)) || await apiRequest(`/reservas/${id}`);
        const resumo = await apiRequest(`/reservas/${id}/checkout/resumo`);
        reservaCheckoutId = id;
        preencherCheckout(reserva, resumo);
        document.getElementById("modalCheckout")?.classList.add("aberto");
        document.getElementById("btnFecharCheckout")?.focus();
    } catch (erro) {
        console.error("Erro ao preparar check-out:", erro);
        mostrarMensagem(erro.message || "Não foi possível carregar a conferência.", "erro");
    }
}

function preencherCheckout(reserva, resumo) {
    const consumos = Array.isArray(resumo.consumos) ? resumo.consumos : [];
    const hospede = reserva.hospede?.nome || "Hóspede não informado";
    const quarto = reserva.quarto?.numero || "-";
    document.getElementById("checkoutHospede").textContent = `${hospede} — Reserva #${reserva.id}`;
    document.getElementById("checkoutQuarto").textContent = `Quarto ${quarto}`;

    // A saída antecipada é permitida, mas fica destacada para conferência.
    const prevista = String(reserva.dataCheckoutPrevista || "").slice(0, 10);
    const hoje = new Date().toISOString().slice(0, 10);
    document.getElementById("checkoutAvisoData").textContent = prevista && hoje < prevista
        ? `Saída antecipada: prevista para ${formatarData(prevista)}.`
        : "";

    const quantidade = Number(resumo.quantidadeDiarias || 1);
    document.getElementById("checkoutQuantidadeDiarias").textContent = `${quantidade} ${quantidade === 1 ? "diária" : "diárias"}`;
    document.getElementById("checkoutValorDiaria").textContent = formatarMoeda(resumo.valorDiaria);
    document.getElementById("checkoutTotalDiarias").textContent = formatarMoeda(resumo.totalDiarias);

    const lista = document.getElementById("checkoutConsumos");
    lista.replaceChildren();
    if (!consumos.length) {
        const vazio = document.createElement("p");
        vazio.className = "checkout-vazio";
        vazio.textContent = "Nenhum consumo registrado para esta hospedagem.";
        lista.appendChild(vazio);
    }
    // Montagem via DOM/textContent protege descrições digitadas pelo usuário.
    consumos.forEach(consumo => {
        const item = document.createElement("div");
        item.className = "checkout-consumo-item";
        const dados = document.createElement("div");
        const descricao = document.createElement("strong");
        descricao.textContent = consumo.descricao;
        const data = document.createElement("small");
        data.textContent = new Date(consumo.dataLancamento).toLocaleString("pt-BR");
        dados.append(descricao, data);
        const valor = document.createElement("strong");
        valor.textContent = formatarMoeda(consumo.valor);
        const remover = document.createElement("button");
        remover.type = "button";
        remover.className = "btn-remover-consumo";
        remover.textContent = "Remover";
        remover.addEventListener("click", () => removerConsumoCheckout(consumo.id, consumo.descricao));
        item.append(dados, valor, remover);
        lista.appendChild(item);
    });
    document.getElementById("checkoutTotal").textContent = formatarMoeda(resumo.totalConsumos);
    document.getElementById("checkoutTotalGeral").textContent = formatarMoeda(resumo.totalGeral);
}

async function removerConsumoCheckout(id, descricao) {
    // A API aceita a remoção apenas enquanto a hospedagem está em CHECKIN.
    if (!confirm(`Remover o consumo "${descricao}" desta hospedagem?`)) return;
    try {
        await apiRequest(`/consumos/${id}`, "DELETE");
        await realizarCheckout(reservaCheckoutId);
    } catch (erro) {
        mostrarMensagem(erro.message || "Não foi possível remover o consumo.", "erro");
    }
}

async function confirmarCheckout() {
    if (!reservaCheckoutId) return;
    const botao = document.getElementById("btnConfirmarCheckout");
    // Bloqueia confirmações duplicadas enquanto a requisição está em andamento.
    botao.disabled = true;
    try {
        await apiRequest(`/reservas/${reservaCheckoutId}/checkout`, "POST");
        fecharModalCheckout();
        mostrarMensagem("Check-out realizado com sucesso!", "sucesso");
        await carregarReservas();
    } catch (erro) {
        mostrarMensagem(erro.message || "Não foi possível realizar o check-out.", "erro");
    } finally {
        botao.disabled = false;
    }
}

function fecharModalCheckout() {
    document.getElementById("modalCheckout")?.classList.remove("aberto");
    reservaCheckoutId = null;
}

function formatarMoeda(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

    document.getElementById("btnFecharModalDetalhes")?.focus();

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

function configurarModalDetalhes() {

    const modal = document.getElementById("modalDetalhes");
    document.getElementById("btnFecharModalDetalhes")?.addEventListener("click", fecharModal);
    document.getElementById("btnFecharModalRodape")?.addEventListener("click", fecharModal);
    document.getElementById("btnFecharCheckout")?.addEventListener("click", fecharModalCheckout);
    document.getElementById("btnCancelarCheckout")?.addEventListener("click", fecharModalCheckout);
    document.getElementById("btnConfirmarCheckout")?.addEventListener("click", confirmarCheckout);

    // Clicar no fundo escuro fecha o modal; clicar no conteúdo não fecha.
    modal?.addEventListener("click", evento => {
        if (evento.target === modal) fecharModal();
    });

    const modalCheckout = document.getElementById("modalCheckout");
    modalCheckout?.addEventListener("click", evento => {
        if (evento.target === modalCheckout) fecharModalCheckout();
    });

    // Escape fecha qualquer modal que estiver aberto.
    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && modal?.classList.contains("aberto")) {
            fecharModal();
        }
        if (evento.key === "Escape" && modalCheckout?.classList.contains("aberto")) {
            fecharModalCheckout();
        }
    });

}
