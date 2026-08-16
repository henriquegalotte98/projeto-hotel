// ============================================================
// USUÁRIOS - CRUD COMPLETO
// HotelWeb - Frontend
// ============================================================

const API_URL = '/api/usuarios';


// ============================================================
// INICIALIZAÇÃO DA PÁGINA
// ============================================================

function initUsuarios() {

    const usuarioLogado =
        localStorage.getItem('usuarioLogado');

    if (!usuarioLogado) {
        window.location.href = 'login.html';
        return;
    }

    try {

        const usuario =
            JSON.parse(usuarioLogado);

        // Apenas ADMIN pode gerenciar usuários
        if (usuario.papel !== 'ADMIN') {

            alert(
                'Acesso negado. Apenas administradores podem gerenciar usuários.'
            );

            window.location.href = 'dashboard.html';
            return;
        }

        // ========================================================
        // INFORMAÇÕES DO USUÁRIO LOGADO
        // ========================================================

        const nomeEl =
            document.getElementById('usuario-nome');

        const papelEl =
            document.getElementById('usuario-papel');

        if (nomeEl) {
            nomeEl.textContent =
                usuario.nome || 'Administrador';
        }

        if (papelEl) {

            papelEl.textContent =
                usuario.papel || 'ADMIN';

            papelEl.className =
                `badge badge-${(
                    usuario.papel || ''
                ).toLowerCase()}`;
        }

    } catch (error) {

        console.error(
            'Erro ao interpretar usuário logado:',
            error
        );

        localStorage.removeItem('usuarioLogado');

        window.location.href = 'login.html';

        return;
    }

    // Carrega usuários
    carregarUsuarios();

    // Configura formulário
    configurarFormulario();

    // Configura modal
    configurarModal();
}


// ============================================================
// LISTAR USUÁRIOS
// GET /api/usuarios
// ============================================================

async function carregarUsuarios() {

    const tbody =
        document.getElementById('lista-usuarios');

    if (!tbody) {
        console.warn(
            'Elemento #lista-usuarios não encontrado.'
        );
        return;
    }

    tbody.innerHTML = `
        <tr>
            <td colspan="5" class="loading-message">
                <i class="fa-solid fa-spinner fa-spin"></i>
                Carregando usuários...
            </td>
        </tr>
    `;

    try {

        const response =
            await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

        if (!response.ok) {

            throw new Error(
                `Erro ${response.status} ao buscar usuários`
            );
        }

        const usuarios =
            await response.json();

        if (
            !usuarios ||
            usuarios.length === 0
        ) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-message">
                        <i class="fa-regular fa-user"></i>
                        Nenhum usuário cadastrado
                    </td>
                </tr>
            `;

            return;
        }

        tbody.innerHTML = '';

        usuarios.forEach(usuario => {

            const tr =
                document.createElement('tr');

            tr.innerHTML = `

                <td>
                    ${usuario.id ?? '-'}
                </td>

                <td>
                    <strong>
                        ${usuario.nome ?? '-'}
                    </strong>
                </td>

                <td>
                    ${formatarCPF(usuario.cpf)}
                </td>

                <td>
                    <span class="badge badge-${(
                        usuario.papel || ''
                    ).toLowerCase()}">
                        ${usuario.papel ?? '-'}
                    </span>
                </td>

                <td style="text-align: center;">

                    <div
                        class="action-buttons"
                        style="justify-content: center;"
                    >

                        <button
                            type="button"
                            class="btn-edit"
                            onclick="editarUsuario(${usuario.id})"
                            title="Editar usuário"
                        >
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            type="button"
                            class="btn-delete"
                            onclick="desativarUsuario(${usuario.id})"
                            title="Desativar usuário"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>

                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (error) {

        console.error(
            'Erro ao carregar usuários:',
            error
        );

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="loading-message"
                    style="color: var(--danger);"
                >
                    <i class="fa-solid fa-circle-exclamation"></i>
                    ${error.message || 'Erro ao carregar usuários'}
                </td>
            </tr>
        `;
    }
}


// ============================================================
// ABRIR CADASTRO
// ============================================================

function abrirCadastro() {

    const form =
        document.getElementById('formUsuario');

    const modal =
        document.getElementById('modalUsuario');

    const titulo =
        document.getElementById('modalTitulo');

    const senha =
        document.getElementById('senha');

    const senhaHelp =
        document.getElementById('senhaHelp');

    if (!form || !modal) {
        return;
    }

    form.reset();

    const usuarioId =
        document.getElementById('usuarioId');

    if (usuarioId) {
        usuarioId.value = '';
    }

    if (senha) {

        senha.required = true;

        senha.placeholder =
            'Mínimo 6 caracteres';
    }

    if (senhaHelp) {

        senhaHelp.textContent =
            'Digite uma senha para o novo usuário';
    }

    if (titulo) {
        titulo.textContent =
            'Novo Usuário';
    }

    modal.classList.add('active');
}


// ============================================================
// BUSCAR USUÁRIO PARA EDIÇÃO
// GET /api/usuarios/{id}
// ============================================================

async function editarUsuario(id) {

    try {

        const response =
            await fetch(`${API_URL}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

        if (!response.ok) {

            throw new Error(
                `Erro ${response.status} ao buscar usuário`
            );
        }

        const usuario =
            await response.json();

        // ========================================================
        // PREENCHER FORMULÁRIO
        // ========================================================

        const usuarioId =
            document.getElementById('usuarioId');

        const nome =
            document.getElementById('nome');

        const cpf =
            document.getElementById('cpf');

        const papel =
            document.getElementById('papel');

        const senha =
            document.getElementById('senha');

        const senhaHelp =
            document.getElementById('senhaHelp');

        const modalTitulo =
            document.getElementById('modalTitulo');

        const modal =
            document.getElementById('modalUsuario');

        if (usuarioId) {
            usuarioId.value =
                usuario.id;
        }

        if (nome) {
            nome.value =
                usuario.nome || '';
        }

        if (cpf) {
            cpf.value =
                usuario.cpf || '';
        }

        if (papel) {
            papel.value =
                usuario.papel || '';
        }

        // Nunca preenche a senha existente
        if (senha) {

            senha.value = '';

            senha.required = false;

            senha.placeholder =
                'Deixe em branco para manter a atual';
        }

        if (senhaHelp) {

            senhaHelp.textContent =
                'Digite uma nova senha apenas se quiser alterar';
        }

        if (modalTitulo) {

            modalTitulo.textContent =
                'Editar Usuário';
        }

        if (modal) {
            modal.classList.add('active');
        }

    } catch (error) {

        console.error(
            'Erro ao carregar usuário:',
            error
        );

        alert(
            'Erro ao carregar usuário: ' +
            (error.message || 'Tente novamente')
        );
    }
}


// ============================================================
// SALVAR USUÁRIO
// POST /api/usuarios
// PUT  /api/usuarios/{id}
// ============================================================

async function salvarUsuario(event) {

    event.preventDefault();

    // ========================================================
    // CAMPOS
    // ========================================================

    const usuarioId =
        document.getElementById('usuarioId');

    const nomeEl =
        document.getElementById('nome');

    const cpfEl =
        document.getElementById('cpf');

    const senhaEl =
        document.getElementById('senha');

    const papelEl =
        document.getElementById('papel');

    const id =
        usuarioId?.value.trim();

    const nome =
        nomeEl?.value.trim();

    const cpf =
        cpfEl?.value.trim();

    const senha =
        senhaEl?.value || '';

    const papel =
        papelEl?.value;

    // ========================================================
    // VALIDAÇÕES
    // ========================================================

    if (!nome || !cpf || !papel) {

        alert(
            'Preencha todos os campos obrigatórios.'
        );

        return;
    }

    // Remove máscara do CPF
    const cpfLimpo =
        cpf.replace(/\D/g, '');

    if (cpfLimpo.length !== 11) {

        alert(
            'Digite um CPF válido com 11 números.'
        );

        return;
    }

    // Senha obrigatória no cadastro
    if (!id && !senha) {

        alert(
            'A senha é obrigatória para novos usuários.'
        );

        return;
    }

    // Senha mínima
    if (senha && senha.length < 6) {

        alert(
            'A senha deve ter pelo menos 6 caracteres.'
        );

        return;
    }

    // ========================================================
    // DADOS ENVIADOS AO BACKEND
    // ========================================================

    const dados = {
        nome: nome,
        cpf: cpfLimpo,
        papel: papel
    };

    // Só envia senha se estiver preenchida
    if (senha) {
        dados.senha = senha;
    }

    try {

        let response;

        // ======================================================
        // ATUALIZAÇÃO
        // PUT /api/usuarios/{id}
        // ======================================================

        if (id) {

            response =
                await fetch(
                    `${API_URL}/${id}`,
                    {
                        method: 'PUT',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(dados)
                    }
                );

        }

        // ======================================================
        // CADASTRO
        // POST /api/usuarios
        // ======================================================

        else {

            response =
                await fetch(
                    API_URL,
                    {
                        method: 'POST',

                        headers: {
                            'Content-Type':
                                'application/json'
                        },

                        body:
                            JSON.stringify(dados)
                    }
                );
        }

        // ======================================================
        // TRATAMENTO DE ERRO
        // ======================================================

        if (!response.ok) {

            let mensagem =
                `Erro ${response.status}`;

            try {

                const erro =
                    await response.json();

                if (erro.message) {
                    mensagem =
                        erro.message;
                }

            } catch {
                // Resposta sem JSON
            }

            throw new Error(mensagem);
        }

        // ======================================================
        // SUCESSO
        // ======================================================

        if (id) {

            alert(
                'Usuário atualizado com sucesso!'
            );

        } else {

            alert(
                'Usuário cadastrado com sucesso!'
            );
        }

        fecharModal();

        await carregarUsuarios();

    } catch (error) {

        console.error(
            'Erro ao salvar usuário:',
            error
        );

        alert(
            'Erro ao salvar usuário: ' +
            (error.message || 'Tente novamente')
        );
    }
}


// ============================================================
// DESATIVAR USUÁRIO
// DELETE /api/usuarios/{id}
// ============================================================

async function desativarUsuario(id) {

    const confirmar =
        confirm(
            'Tem certeza que deseja desativar este usuário?\n\n' +
            'Ele não poderá mais acessar o sistema.'
        );

    if (!confirmar) {
        return;
    }

    try {

        const response =
            await fetch(
                `${API_URL}/${id}`,
                {
                    method: 'DELETE'
                }
            );

        if (!response.ok) {

            let mensagem =
                `Erro ${response.status}`;

            try {

                const erro =
                    await response.json();

                if (erro.message) {
                    mensagem =
                        erro.message;
                }

            } catch {
                // DELETE pode retornar 204 sem JSON
            }

            throw new Error(mensagem);
        }

        alert(
            'Usuário desativado com sucesso!'
        );

        await carregarUsuarios();

    } catch (error) {

        console.error(
            'Erro ao desativar usuário:',
            error
        );

        alert(
            'Erro ao desativar usuário: ' +
            (error.message || 'Tente novamente')
        );
    }
}


// ============================================================
// FECHAR MODAL
// ============================================================

function fecharModal() {

    const modal =
        document.getElementById('modalUsuario');

    if (!modal) {
        return;
    }

    modal.classList.remove('active');

    const form =
        document.getElementById('formUsuario');

    if (form) {
        form.reset();
    }

    const usuarioId =
        document.getElementById('usuarioId');

    if (usuarioId) {
        usuarioId.value = '';
    }

    const senha =
        document.getElementById('senha');

    if (senha) {

        senha.required = true;

        senha.placeholder =
            'Mínimo 6 caracteres';
    }

    const senhaHelp =
        document.getElementById('senhaHelp');

    if (senhaHelp) {

        senhaHelp.textContent =
            'Digite uma senha para novo usuário';
    }

    const modalTitulo =
        document.getElementById('modalTitulo');

    if (modalTitulo) {

        modalTitulo.textContent =
            'Novo Usuário';
    }
}


// ============================================================
// FORMATAR CPF
// ============================================================

function formatarCPF(cpf) {

    if (!cpf) {
        return '-';
    }

    const numeros =
        String(cpf).replace(/\D/g, '');

    if (numeros.length !== 11) {
        return cpf;
    }

    return numeros.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
    );
}


// ============================================================
// CONFIGURAR FORMULÁRIO
// ============================================================

function configurarFormulario() {

    const form =
        document.getElementById('formUsuario');

    if (!form) {
        return;
    }

    form.addEventListener(
        'submit',
        salvarUsuario
    );
}


// ============================================================
// CONFIGURAR MODAL
// ============================================================

function configurarModal() {

    const modal =
        document.getElementById('modalUsuario');

    const fechar =
        document.getElementById('modalFechar');

    const cancelar =
        document.getElementById('btnCancelar');

    const novoBtn =
        document.getElementById('btnNovoUsuario');

    // Botão X
    if (fechar) {

        fechar.addEventListener(
            'click',
            fecharModal
        );
    }

    // Botão cancelar
    if (cancelar) {

        cancelar.addEventListener(
            'click',
            fecharModal
        );
    }

    // Botão novo usuário
    if (novoBtn) {

        novoBtn.addEventListener(
            'click',
            abrirCadastro
        );
    }

    // Clique fora do modal
    if (modal) {

        modal.addEventListener(
            'click',
            function (event) {

                if (event.target === modal) {
                    fecharModal();
                }

            }
        );
    }

    // Tecla ESC
    document.addEventListener(
        'keydown',
        function (event) {

            if (
                event.key === 'Escape' &&
                modal &&
                modal.classList.contains('active')
            ) {

                fecharModal();
            }

        }
    );
}


// ============================================================
// EXPORTA FUNÇÕES
// ============================================================

window.carregarUsuarios =
    carregarUsuarios;

window.abrirCadastro =
    abrirCadastro;

window.editarUsuario =
    editarUsuario;

window.salvarUsuario =
    salvarUsuario;

window.desativarUsuario =
    desativarUsuario;

window.fecharModal =
    fecharModal;

window.formatarCPF =
    formatarCPF;


// ============================================================
// INICIALIZA
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    initUsuarios
);