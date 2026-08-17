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

    // Login com Enter (tecla ENTER no campo senha)
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
 * @param {Event} e - Evento do formulário
 */
async function handleLogin(e) {
    e.preventDefault();

    const cpf = document.getElementById('cpf').value.trim();
    const senha = document.getElementById('senha').value.trim();
    const btnLogin = document.getElementById('btnLogin');
    const btnTexto = document.getElementById('btnTexto');
    const btnLoader = document.getElementById('btnLoader');
    const mensagemErro = document.getElementById('mensagem-erro');

    // Limpa erro anterior
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

    // Desabilita botão e mostra loader
    btnLogin.disabled = true;
    btnTexto.style.display = 'none';
    btnLoader.style.display = 'inline-block';

    try {
        // Tenta autenticar
        const usuario = await autenticar(cpf, senha);

        if (usuario && usuario.papel) {
            // Salva no localStorage
            localStorage.setItem('usuarioLogado', JSON.stringify(usuario));
            
            // Redireciona para o dashboard
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
        // Reabilita o botão
        btnLogin.disabled = false;
        btnTexto.style.display = 'inline';
        btnLoader.style.display = 'none';
    }
}

/**
 * Função de autenticação - TEMPORÁRIA (mock)
 * Quando a API estiver pronta, substituir pela chamada real
 */
async function autenticar(cpf, senha) {
    return apiRequest('/auth/login', 'POST', { cpf, senha });

    // ============================================================
    // QUANDO A API ESTIVER PRONTA, DESCOMENTE ESTA PARTE:
    // ============================================================
    // return await apiRequest('/auth/login', 'POST', { cpf, senha });
    // ============================================================

    // ============================================================
    // MOCK PARA TESTE (REMOVER QUANDO A API ESTIVER PRONTA)
    // ============================================================
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Usuários mockados para teste
            const usuarios = [
                { id: 1, nome: 'Administrador', cpf: '12345678901', papel: 'ADMIN' },
                { id: 2, nome: 'João Silva', cpf: '98765432100', papel: 'RECEPCIONISTA' },
                { id: 3, nome: 'Maria Oliveira', cpf: '45678912300', papel: 'GOVERNANCA' },
                { id: 4, nome: 'Carlos Souza', cpf: '78912345600', papel: 'MANUTENCAO' }
            ];

            const usuario = usuarios.find(u => u.cpf === cpf);
            
            if (usuario && senha.length >= 6) {
                resolve(usuario);
            } else {
                const error = new Error('Credenciais inválidas');
                error.status = 401;
                reject(error);
            }
        }, 500);
    });
}

/**
 * Mostra mensagem de erro
 * @param {string} mensagem - Texto do erro
 */
function mostrarErro(mensagem) {
    const mensagemErro = document.getElementById('mensagem-erro');
    
    if (mensagemErro) {
        mensagemErro.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${mensagem}`;
        mensagemErro.style.display = 'flex';
        mensagemErro.classList.add('show');
        
        // Limpa o erro após 5 segundos
        setTimeout(() => {
            mensagemErro.classList.remove('show');
            mensagemErro.style.display = 'none';
        }, 5000);
    }
}

/**
 * Função de logout (pode ser chamada de qualquer lugar)
 */
function fazerLogout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'login.html';
}

// ============================================================
// EXPORTA FUNÇÕES PARA USO GLOBAL
// ============================================================
window.initLogin = initLogin;
window.fazerLogout = fazerLogout;
window.mostrarErro = mostrarErro;

// ============================================================
// INICIALIZA
// ============================================================
document.addEventListener('DOMContentLoaded', initLogin);
