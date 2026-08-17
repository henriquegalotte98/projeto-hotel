// ============================================================
// USUÁRIOS - CRUD completo (Dev 02)
// ============================================================

/**
 * Inicializa a página de usuários
 */
function initUsuarios() {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
        window.location.href = "login.html";
        return;
    }

    try {
        const usuario = JSON.parse(usuarioLogado);
        
        if (usuario.papel !== 'ADMIN') {
            alert('Acesso negado. Apenas administradores podem gerenciar usuários.');
            window.location.href = "dashboard.html";
            return;
        }

        const nomeEl = document.getElementById("usuario-nome");
        const papelEl = document.getElementById("usuario-papel");
        const avatarEl = document.getElementById("avatar-inicial");
        
        if (nomeEl) nomeEl.textContent = usuario.nome || "Colaborador";
        if (papelEl) {
            papelEl.textContent = usuario.papel || "FUNCIONARIO";
            papelEl.className = `badge badge-${(usuario.papel || '').toLowerCase()}`;
        }
        if (avatarEl && usuario.nome) {
            const iniciais = usuario.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
            avatarEl.textContent = iniciais;
        }

    } catch (e) {
        console.error("Erro ao interpretar dados do usuário:", e);
        window.location.href = "login.html";
        return;
    }

    carregarUsuarios();
    configurarFormulario();
    configurarModal();
}

/**
 * Busca a lista de usuários da API
 */
async function carregarUsuarios() {
    const tbody = document.getElementById('lista-usuarios');
    if (!tbody) return;

    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="loading-message">
                    <i class="fa-solid fa-spinner fa-spin"></i> Carregando usuários...
                </td>
            </tr>
        `;

        // ============================================================
        // CHAMADA REAL PARA A API
        // ============================================================
        const usuarios = await apiRequest('/usuarios', 'GET');

        if (!usuarios || usuarios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-message">
                        <i class="fa-regular fa-user"></i> Nenhum usuário cadastrado
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = '';
        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${formatarCPF(usuario.cpf) || '-'}</td>
                <td><strong>${usuario.nome || '-'}</strong></td>
                <td><span class="badge badge-${(usuario.papel || '').toLowerCase()}">${usuario.papel || '-'}</span></td>
                <td style="text-align: center;">
                    <div class="action-buttons" style="justify-content: center;">
                        <button class="btn-edit" onclick="editarUsuario('${usuario.cpf}')">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button class="btn-delete" onclick="desativarUsuario('${usuario.cpf}')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="loading-message" style="color: var(--danger);">
                    <i class="fa-solid fa-circle-exclamation"></i> Erro: ${error.message || 'Tente novamente'}
                </td>
            </tr>
        `;
    }
}

/**
 * Prepara o formulário para cadastrar um novo usuário
 */
function abrirCadastro() {
    const form = document.getElementById('formUsuario');
    const modal = document.getElementById('modalUsuario');
    const titulo = document.getElementById('modalTitulo');
    const senhaHelp = document.getElementById('senhaHelp');

    form.reset();
    document.getElementById('usuarioCpfOriginal').value = '';
    document.getElementById('senha').required = true;
    document.getElementById('senha').placeholder = 'Mínimo 6 caracteres';
    senhaHelp.textContent = 'Digite uma senha para o novo usuário';

    titulo.textContent = 'Novo Usuário';
    modal.classList.add('active');
}

/**
 * Prepara o formulário para editar um usuário existente
 */
async function editarUsuario(cpf) {
    try {
        // ============================================================
        // CHAMADA REAL PARA A API
        // ============================================================
        const usuario = await apiRequest(`/usuarios/${cpf}`, 'GET');

        document.getElementById('usuarioCpfOriginal').value = usuario.cpf;
        document.getElementById('nome').value = usuario.nome || '';
        document.getElementById('cpf').value = usuario.cpf || '';
        document.getElementById('papel').value = usuario.papel || '';
        document.getElementById('senha').required = false;
        document.getElementById('senha').placeholder = 'Deixe em branco para manter a atual';
        document.getElementById('senhaHelp').textContent = 'Digite uma nova senha apenas se quiser alterar';

        document.getElementById('modalTitulo').textContent = 'Editar Usuário';
        document.getElementById('modalUsuario').classList.add('active');

    } catch (error) {
        alert('Erro ao carregar usuário: ' + (error.message || 'Tente novamente'));
    }
}

/**
 * Salva um usuário (cria ou atualiza)
 */
async function salvarUsuario(event) {
    event.preventDefault();

    const cpfOriginal = document.getElementById('usuarioCpfOriginal').value;
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const senha = document.getElementById('senha').value;
    const papel = document.getElementById('papel').value;

    if (!nome || !cpf || !papel) {
        alert('Preencha todos os campos obrigatórios');
        return;
    }

    if (!cpfOriginal && !senha) {
        alert('A senha é obrigatória para novos usuários');
        return;
    }

    if (senha && senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        return;
    }

    const cpfLimpo = cpf.replace(/\D/g, '');
    const dados = { nome, cpf: cpfLimpo, papel };
    if (senha) {
        dados.senha = senha;
    }

    try {
        if (cpfOriginal) {
            // ============================================================
            // CHAMADA REAL PARA A API
            // ============================================================
            await apiRequest(`/usuarios/${cpfOriginal}`, 'PUT', dados);
            alert('Usuário atualizado com sucesso!');
        } else {
            // ============================================================
            // CHAMADA REAL PARA A API
            // ============================================================
            await apiRequest('/usuarios', 'POST', dados);
            alert('Usuário cadastrado com sucesso!');
        }

        fecharModal();
        carregarUsuarios();

    } catch (error) {
        alert('Erro ao salvar usuário: ' + (error.message || 'Tente novamente'));
    }
}

/**
 * Desativa um usuário
 */
async function desativarUsuario(cpf) {
    if (!confirm('Tem certeza que deseja desativar este usuário? Ele não poderá mais acessar o sistema.')) {
        return;
    }

    try {
        // ============================================================
        // CHAMADA REAL PARA A API
        // ============================================================
        await apiRequest(`/usuarios/${cpf}`, 'DELETE');
        alert('Usuário desativado com sucesso!');
        carregarUsuarios();
    } catch (error) {
        alert('Erro ao desativar usuário: ' + (error.message || 'Tente novamente'));
    }
}

/**
 * Fecha o modal
 */
function fecharModal() {
    const modal = document.getElementById('modalUsuario');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('formUsuario').reset();
        document.getElementById('usuarioCpfOriginal').value = '';
        document.getElementById('senha').required = true;
        document.getElementById('senha').placeholder = 'Mínimo 6 caracteres';
        document.getElementById('senhaHelp').textContent = 'Digite uma senha para novo usuário (opcional na edição)';
    }
}

/**
 * Formata CPF para exibição (XXX.XXX.XXX-XX)
 */
function formatarCPF(cpf) {
    if (!cpf) return '-';
    const numeros = cpf.replace(/\D/g, '');
    if (numeros.length !== 11) return cpf;
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Configura eventos do formulário
 */
function configurarFormulario() {
    const form = document.getElementById('formUsuario');
    if (form) {
        form.addEventListener('submit', salvarUsuario);
    }
}

/**
 * Configura eventos do modal
 */
function configurarModal() {
    const modal = document.getElementById('modalUsuario');
    const fechar = document.getElementById('modalFechar');
    const cancelar = document.getElementById('btnCancelar');
    const novoBtn = document.getElementById('btnNovoUsuario');

    if (fechar) {
        fechar.addEventListener('click', fecharModal);
    }

    if (cancelar) {
        cancelar.addEventListener('click', fecharModal);
    }

    if (novoBtn) {
        novoBtn.addEventListener('click', abrirCadastro);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            fecharModal();
        }
    });
}

// ============================================================
// EXPORTA FUNÇÕES
// ============================================================
window.carregarUsuarios = carregarUsuarios;
window.abrirCadastro = abrirCadastro;
window.editarUsuario = editarUsuario;
window.desativarUsuario = desativarUsuario;
window.fecharModal = fecharModal;

// ============================================================
// INICIALIZA
// ============================================================
document.addEventListener('DOMContentLoaded', initUsuarios);
