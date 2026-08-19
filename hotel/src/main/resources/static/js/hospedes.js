// ============================================================
// HÓSPEDES - CRUD completo
// ============================================================

/**
 * Inicializa a página de hóspedes
 */
function initHospedes() {

    const usuarioLogado = localStorage.getItem("usuarioLogado");

    if (!usuarioLogado) {
        window.location.href = "login.html";
        return;
    }

    try {

        const usuario = JSON.parse(usuarioLogado);

        const nomeEl = document.getElementById("usuario-nome");
        const papelEl = document.getElementById("usuario-papel");
        const avatarEl = document.getElementById("avatar-inicial");

        if (nomeEl) {
            nomeEl.textContent = usuario.nome || "Colaborador";
        }

        if (papelEl) {

            papelEl.textContent =
                usuario.papel || "FUNCIONARIO";

            papelEl.className =
                `badge badge-${(usuario.papel || "").toLowerCase()}`;
        }

        if (avatarEl && usuario.nome) {

            const iniciais = usuario.nome
                .split(" ")
                .filter(nome => nome.length > 0)
                .map(nome => nome[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

            avatarEl.textContent = iniciais;
        }

    } catch (error) {

        console.error(
            "Erro ao interpretar dados do usuário:",
            error
        );

        window.location.href = "login.html";
        return;
    }

    carregarHospedes();
    configurarFormulario();
    configurarModal();
    configurarBusca();
}


/**
 * ============================================================
 * BUSCAR HÓSPEDES
 * GET /api/hospedes
 * ============================================================
 */
async function carregarHospedes() {

    const tbody =
        document.getElementById("lista-hospedes");

    if (!tbody) {
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="loading-message">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Carregando hóspedes...
            </td>
        </tr>
    `;

    try {

        const hospedes =
            await apiRequest("/hospedes", "GET");

        if (!hospedes || hospedes.length === 0) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-message">
                        <i class="fa-regular fa-user"></i>
                        Nenhum hóspede cadastrado
                    </td>
                </tr>
            `;

            return;
        }

        renderizarHospedes(hospedes);

    } catch (error) {

        console.error(
            "Erro ao carregar hóspedes:",
            error
        );

        tbody.innerHTML = `
            <tr>
                <td colspan="5"
                    class="loading-message">

                    <i class="fa-solid fa-circle-exclamation"></i>

                    Erro ao carregar hóspedes:
                    ${obterMensagemErro(error)}

                </td>
            </tr>
        `;
    }
}


/**
 * ============================================================
 * RENDERIZAR TABELA
 * ============================================================
 */
function renderizarHospedes(hospedes) {

    const tbody =
        document.getElementById("lista-hospedes");

    tbody.innerHTML = "";

    hospedes.forEach(hospede => {

        const tr =
            document.createElement("tr");

        tr.innerHTML = `

            <td>
                <strong>
                    ${escaparHTML(hospede.nome || "-")}
                </strong>
            </td>

            <td>
                ${formatarCPF(hospede.cpf)}
            </td>

            <td>
                ${escaparHTML(hospede.telefone || "-")}
            </td>

            <td>
                ${escaparHTML(hospede.email || "-")}
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        type="button"
                        class="btn-edit"
                        title="Editar hóspede"
                        onclick="editarHospede(${hospede.id})">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button
                        type="button"
                        class="btn-delete"
                        title="Excluir hóspede"
                        onclick="excluirHospede(${hospede.id})">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            </td>
        `;

        tbody.appendChild(tr);
    });
}


/**
 * ============================================================
 * ABRIR CADASTRO
 * ============================================================
 */
function abrirCadastro() {

    const form =
        document.getElementById("formHospede");

    const modal =
        document.getElementById("modalHospede");

    const titulo =
        document.getElementById("modalTitulo");

    form.reset();

    document.getElementById("hospedeId").value = "";

    titulo.textContent = "Novo Hóspede";

    modal.classList.add("active");

    document.getElementById("nome").focus();
}


/**
 * ============================================================
 * EDITAR HÓSPEDE
 * GET /api/hospedes/{id}
 * ============================================================
 */
async function editarHospede(id) {

    try {

        const hospede =
            await apiRequest(
                `/hospedes/${id}`,
                "GET"
            );

        document.getElementById("hospedeId").value =
            hospede.id || "";

        document.getElementById("nome").value =
            hospede.nome || "";

        document.getElementById("cpf").value =
            hospede.cpf || "";

        document.getElementById("telefone").value =
            hospede.telefone || "";

        document.getElementById("email").value =
            hospede.email || "";

        document.getElementById("modalTitulo").textContent =
            "Editar Hóspede";

        document
            .getElementById("modalHospede")
            .classList.add("active");

        document.getElementById("nome").focus();

    } catch (error) {

        console.error(
            "Erro ao carregar hóspede:",
            error
        );

        alert(
            "Erro ao carregar hóspede:\n\n" +
            obterMensagemErro(error)
        );
    }
}


/**
 * ============================================================
 * SALVAR HÓSPEDE
 *
 * Novo:
 * POST /api/hospedes
 *
 * Edição:
 * PUT /api/hospedes/{id}
 * ============================================================
 */
async function salvarHospede(event) {

    event.preventDefault();

    const id =
        document.getElementById("hospedeId").value.trim();

    const nome =
        document.getElementById("nome").value.trim();

    const cpf =
        document.getElementById("cpf").value
            .replace(/\D/g, "");

    const telefone =
        document.getElementById("telefone").value.trim();

    const email =
        document.getElementById("email").value.trim();


    // ============================================================
    // VALIDAÇÕES
    // ============================================================

    if (!nome) {

        alert("Digite o nome do hóspede.");

        document.getElementById("nome").focus();

        return;
    }

    if (!cpf) {

        alert("Digite o CPF do hóspede.");

        document.getElementById("cpf").focus();

        return;
    }

    if (cpf.length !== 11) {

        alert("O CPF deve possuir 11 números.");

        document.getElementById("cpf").focus();

        return;
    }

    if (!telefone) {

        alert("Digite o telefone do hóspede.");

        document.getElementById("telefone").focus();

        return;
    }

    if (!email) {

        alert("Digite o e-mail do hóspede.");

        document.getElementById("email").focus();

        return;
    }


    // ============================================================
    // DADOS ENVIADOS AO BACKEND
    // ============================================================

    const dados = {
        nome: nome,
        cpf: cpf,
        telefone: telefone,
        email: email
    };


    // ============================================================
    // ENVIA PARA API
    // ============================================================

    try {

        if (id) {

            await apiRequest(
                `/hospedes/${id}`,
                "PUT",
                dados
            );

            alert(
                "Hóspede atualizado com sucesso!"
            );

        } else {

            await apiRequest(
                "/hospedes",
                "POST",
                dados
            );

            alert(
                "Hóspede cadastrado com sucesso!"
            );
        }


        fecharModal();

        await carregarHospedes();

    } catch (error) {

        console.error(
            "Erro ao salvar hóspede:",
            error
        );

        alert(
            "Erro ao salvar hóspede:\n\n" +
            obterMensagemErro(error)
        );
    }
}


/**
 * ============================================================
 * EXCLUIR HÓSPEDE
 * DELETE /api/hospedes/{id}
 * ============================================================
 */
async function excluirHospede(id) {

    const confirmou =
        confirm(
            "Tem certeza que deseja excluir este hóspede?"
        );

    if (!confirmou) {
        return;
    }


    try {

        await apiRequest(
            `/hospedes/${id}`,
            "DELETE"
        );

        alert(
            "Hóspede excluído com sucesso!"
        );

        await carregarHospedes();

    } catch (error) {

        console.error(
            "Erro ao excluir hóspede:",
            error
        );

        alert(
            "Erro ao excluir hóspede:\n\n" +
            obterMensagemErro(error)
        );
    }
}


/**
 * ============================================================
 * FECHAR MODAL
 * ============================================================
 */
function fecharModal() {

    const modal =
        document.getElementById("modalHospede");

    const form =
        document.getElementById("formHospede");

    if (modal) {
        modal.classList.remove("active");
    }

    if (form) {
        form.reset();
    }

    const id =
        document.getElementById("hospedeId");

    if (id) {
        id.value = "";
    }
}


/**
 * ============================================================
 * CONFIGURAR FORMULÁRIO
 * ============================================================
 */
function configurarFormulario() {

    const form =
        document.getElementById("formHospede");

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        salvarHospede
    );
}


/**
 * ============================================================
 * CONFIGURAR MODAL
 * ============================================================
 */
function configurarModal() {

    const modal =
        document.getElementById("modalHospede");

    const fechar =
        document.getElementById("modalFechar");

    const cancelar =
        document.getElementById("btnCancelar");

    const novo =
        document.getElementById("btnNovoHospede");


    if (fechar) {

        fechar.addEventListener(
            "click",
            fecharModal
        );
    }


    if (cancelar) {

        cancelar.addEventListener(
            "click",
            fecharModal
        );
    }


    if (novo) {

        novo.addEventListener(
            "click",
            abrirCadastro
        );
    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (event.target === modal) {

                    fecharModal();
                }
            }
        );
    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal &&
                modal.classList.contains("active")
            ) {

                fecharModal();
            }
        }
    );
}


/**
 * ============================================================
 * BUSCA
 * ============================================================
 */
function configurarBusca() {

    const campo =
        document.getElementById("campoBusca");

    if (!campo) {
        return;
    }


    campo.addEventListener(
        "input",
        () => {

            const termo =
                campo.value
                    .toLowerCase()
                    .trim();


            const linhas =
                document.querySelectorAll(
                    "#lista-hospedes tr"
                );


            linhas.forEach(linha => {

                const texto =
                    linha.textContent
                        .toLowerCase();

                linha.style.display =
                    texto.includes(termo)
                        ? ""
                        : "none";
            });
        }
    );
}


/**
 * ============================================================
 * FORMATA CPF
 * ============================================================
 */
function formatarCPF(cpf) {

    if (!cpf) {
        return "-";
    }

    const numeros =
        String(cpf).replace(/\D/g, "");


    if (numeros.length !== 11) {
        return escaparHTML(String(cpf));
    }


    return numeros.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        "$1.$2.$3-$4"
    );
}


/**
 * ============================================================
 * ESCAPA HTML
 *
 * Evita inserir conteúdo HTML diretamente na tabela.
 * ============================================================
 */
function escaparHTML(valor) {

    const div =
        document.createElement("div");

    div.textContent = valor;

    return div.innerHTML;
}


/**
 * ============================================================
 * TRATA MENSAGEM DE ERRO
 * ============================================================
 */
function obterMensagemErro(error) {

    if (!error) {
        return "Erro desconhecido.";
    }


    if (error.message) {
        return error.message;
    }


    if (error.data) {

        if (typeof error.data === "string") {
            return error.data;
        }

        try {
            return JSON.stringify(error.data);
        } catch (e) {
            return "Erro retornado pelo servidor.";
        }
    }


    return "Tente novamente.";
}


// ============================================================
// EXPORTA FUNÇÕES
// ============================================================

window.carregarHospedes =
    carregarHospedes;

window.abrirCadastro =
    abrirCadastro;

window.editarHospede =
    editarHospede;

window.excluirHospede =
    excluirHospede;

window.fecharModal =
    fecharModal;


// ============================================================
// INICIALIZA
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    initHospedes
);