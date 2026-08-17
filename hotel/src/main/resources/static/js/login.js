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

    // Máscara para CPF (apenas números)
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '');
        });
    }

    // Login com Enter
    const senhaInput = document.getElementById('senha');
    if (senhaInput) {
        senhaInput.addEventListener('keypress', function(e) {
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
 */
async function handleLogin(e) {
    e.preventDefault();

    const cpf = document.getElementById('cpf').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const btnLogin = document.getElementById('btnLogin');
    const btnTexto = document.getElementById('btnTexto');
    const btnLoader = document.getElementById('btnLoader');
    const mensagemErro = document.getElementById('mensagem-erro');

    mensagemErro.classList.remove('show');
    mensagemErro.style.display = 'none';

    // Validações
    if (!cpf || cpf.length !== 11) {
        mostrarErro('CPF deve ter 11 números');
        return;
    }

    if (!senha || senha.length < 6) {
        mostrarErro('Senha deve ter pelo menos 6 caracteres');
        return;
    }

    btnLogin.disabled = true;
    btnTexto.style.display = 'none';
    btnLoader.style.display = 'inline-block';

    try {
        // ============================================================
        // CHAMADA REAL PARA A API - LOGIN
        // ============================================================
        const usuario = await apiRequest('/auth/login', 'POST', { cpf, senha });

        // Se o backend retornou o usuário com papel definido
        if (usuario && usuario.papel) {
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            window.location.href = 'dashboard.html';
        } else {
            mostrarErro('Credenciais inválidas. Tente novamente.');
        }

    } catch (error) {
        console.error('Erro no login:', error);
        
        let mensagem = 'Erro ao fazer login. Tente novamente.';
        if (error.status === 401) {
            mensagem = 'CPF ou senha incorretos.';
        } else if (error.status === 404) {
            mensagem = 'Usuário não encontrado.';
        } else if (error.status === 403) {
            mensagem = 'Acesso negado. Contate o administrador.';
        } else if (error.message) {
            mensagem = error.message;
        }
        
        mostrarErro(mensagem);

    } finally {
        btnLogin.disabled = false;
        btnTexto.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

/**
 * Mostra mensagem de erro
 */
function mostrarErro(mensagem) {
    const mensagemErro = document.getElementById('mensagem-erro');
    
    if (mensagemErro) {
        mensagemErro.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${mensagem}`;
        mensagemErro.style.display = 'flex';
        mensagemErro.classList.add('show');
        
        setTimeout(() => {
            mensagemErro.classList.remove('show');
            mensagemErro.style.display = 'none';
        }, 5000);
    }
}

/**
 * Função de logout
 */
function fazerLogout() {
    // Limpa a sessão do front
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
}

// ============================================================
// EXPORTA FUNÇÕES
// ============================================================
window.initLogin = initLogin;
window.fazerLogout = fazerLogout;
window.mostrarErro = mostrarErro;

// ============================================================
// INICIALIZA
// ============================================================
document.addEventListener('DOMContentLoaded', initLogin);