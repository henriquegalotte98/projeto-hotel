// ============================================================
// LOGIN - Lógica da página de login
// ============================================================

/**
 * Inicializa a página de login
 */
function initLogin() {
    // Se já estiver logado, redireciona para o dashboard
    const usuarioLogado = localStorage.getItem('usuarioLogado');

    if (usuarioLogado) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Configura o formulário
    const form = document.getElementById('form-login');

    if (form) {
        form.addEventListener('submit', handleLogin);
    }

    // Máscara para CPF - permite apenas números
    const cpfInput = document.getElementById('cpf');

    if (cpfInput) {
        cpfInput.addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '');
        });
    }

    // Login com Enter no campo de senha
    const senhaInput = document.getElementById('senha');

    if (senhaInput) {
        senhaInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();

                const form = document.getElementById('form-login');

                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        });
    }
}

/**
 * Processa o login do usuário
 *
 * @param {Event} e Evento do formulário
 */
async function handleLogin(e) {
    e.preventDefault();

    const cpf = document.getElementById('cpf').value.trim();
    const senha = document.getElementById('senha').value.trim();

    const btnLogin = document.getElementById('btnLogin');
    const btnTexto = document.getElementById('btnTexto');
    const btnLoader = document.getElementById('btnLoader');
    const mensagemErro = document.getElementById('mensagem-erro');

    // Limpa mensagem de erro anterior
    if (mensagemErro) {
        mensagemErro.classList.remove('show');
        mensagemErro.style.display = 'none';
    }

    // ============================================================
    // VALIDAÇÕES
    // ============================================================

    if (!cpf || cpf.length !== 11) {
        mostrarErro('CPF deve ter 11 números.');
        return;
    }

    if (!senha || senha.length < 6) {
        mostrarErro('Senha deve ter pelo menos 6 caracteres.');
        return;
    }

    // ============================================================
    // DESABILITA O BOTÃO DURANTE O LOGIN
    // ============================================================

    if (btnLogin) {
        btnLogin.disabled = true;
    }

    if (btnTexto) {
        btnTexto.style.display = 'none';
    }

    if (btnLoader) {
        btnLoader.style.display = 'inline-block';
    }

    try {
        // ========================================================
        // AUTENTICAÇÃO REAL COM O BACKEND
        // ========================================================

        const usuario = await autenticar(cpf, senha);

        // Verifica se o backend retornou um usuário válido
        if (usuario && usuario.papel) {

            // Salva o usuário logado
            localStorage.setItem(
                'usuarioLogado',
                JSON.stringify(usuario)
            );

            // Redireciona para o dashboard
            window.location.href = 'dashboard.html';

        } else {
            mostrarErro('Credenciais inválidas. Tente novamente.');
        }

    } catch (error) {

        console.error('Erro no login:', error);

        let mensagem = 'Erro ao fazer login. Tente novamente.';

        if (error.status === 400) {
            mensagem = error.message || 'Dados de login inválidos.';
        } else if (error.status === 401) {
            mensagem = 'CPF ou senha incorretos.';
        } else if (error.status === 403) {
            mensagem = 'Acesso negado. Contate o administrador.';
        } else if (error.status === 404) {
            mensagem = 'Usuário não encontrado.';
        } else if (error.message) {
            mensagem = error.message;
        }

        mostrarErro(mensagem);

    } finally {

        // ========================================================
        // REABILITA O BOTÃO
        // ========================================================

        if (btnLogin) {
            btnLogin.disabled = false;
        }

        if (btnTexto) {
            btnTexto.style.display = 'inline';
        }

        if (btnLoader) {
            btnLoader.style.display = 'none';
        }
    }
}

/**
 * ============================================================
 * AUTENTICAÇÃO REAL
 * ============================================================
 *
 * Envia CPF e senha para o endpoint do backend.
 *
 * Endpoint:
 * POST /api/auth/login
 *
 * O api.js já possui a função apiRequest().
 */
async function autenticar(cpf, senha) {

    return await apiRequest(
        '/auth/login',
        'POST',
        {
            cpf: cpf,
            senha: senha
        }
    );
}

/**
 * Mostra mensagem de erro na tela
 *
 * @param {string} mensagem Texto da mensagem
 */
function mostrarErro(mensagem) {

    const mensagemErro = document.getElementById('mensagem-erro');

    if (!mensagemErro) {
        return;
    }

    mensagemErro.innerHTML = `
        <i class="fa-solid fa-circle-exclamation"></i>
        ${mensagem}
    `;

    mensagemErro.style.display = 'flex';
    mensagemErro.classList.add('show');

    // Remove a mensagem depois de 5 segundos
    setTimeout(() => {

        mensagemErro.classList.remove('show');
        mensagemErro.style.display = 'none';

    }, 5000);
}

/**
 * ============================================================
 * LOGOUT
 * ============================================================
 */
function fazerLogout() {

    // Remove usuário salvo no navegador
    localStorage.removeItem('usuarioLogado');

    // Volta para a tela de login
    window.location.href = 'login.html';
}

// ============================================================
// EXPORTA FUNÇÕES PARA USO GLOBAL
// ============================================================

window.initLogin = initLogin;
window.handleLogin = handleLogin;
window.fazerLogout = fazerLogout;
window.mostrarErro = mostrarErro;
window.autenticar = autenticar;

// ============================================================
// INICIALIZA A PÁGINA
// ============================================================

document.addEventListener('DOMContentLoaded', initLogin);