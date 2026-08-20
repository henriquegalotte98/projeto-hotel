// ============================================================
// API - Comunicação com o Back-end
// ============================================================

// Endereço base do back-end. Os endpoints recebidos pela função abaixo
// são acrescentados a esta URL (exemplo: /quartos ou /reservas).
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Executa uma requisição HTTP para a API do HotelWeb.
 *
 * @param {string} endpoint Caminho iniciado por barra, como "/quartos".
 * @param {string} method Método HTTP; GET é utilizado como padrão.
 * @param {Object|null} body Objeto que será convertido para JSON e enviado.
 * @returns {Promise<*>} Conteúdo devolvido pela API.
 * @throws {Error} Erro gerado quando a requisição falhar.
 */

async function apiRequest(endpoint, method = 'GET', body = null) {
    // Configuração compartilhada por todas as requisições do front-end.
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        // Envia o cookie de sessão criado pelo Spring Security.
        credentials: 'include'
    };

    // GET normalmente não possui corpo. Nos demais casos, o objeto JavaScript
    // precisa ser transformado em JSON antes de ser enviado ao servidor.
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        // Aguarda a resposta HTTP antes de tentar interpretar o conteúdo.
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        let data;
        const contentType = response.headers.get('content-type');

        // Algumas rotas devolvem JSON e outras podem devolver texto ou resposta vazia.
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // fetch não lança erro automaticamente para respostas 4xx ou 5xx.
        // Por isso, transformamos manualmente essas respostas em exceções.
        if (!response.ok) {
            const errorMessage = data?.erro || data?.message || data || 'Erro na requisição';
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;

            // Um 401 fora da tela de login indica que a sessão expirou.
            // Remove o usuário antigo para a interface não parecer autenticada.
            if (response.status === 401 && endpoint !== '/auth/login') {
                localStorage.removeItem('usuarioLogado');
                localStorage.removeItem('token');
                if (!window.location.pathname.endsWith('/login.html')) {
                    window.location.replace('login.html');
                }
            }

            throw error;
        }

        // Entrega para a tela somente o conteúdo já convertido.
        return data;

    } catch (error) {
        // Erros HTTP possuem status. Quando ele não existe, normalmente houve
        // falha de rede, CORS ou o back-end não está em execução.
        if (!error.status) {
            error.message = 'Erro de conexão com o servidor. Verifique se o back-end está rodando.';
        }
        throw error;
    }
}

// Expõe a função para os scripts das telas, que não utilizam módulos ES.
window.apiRequest = apiRequest;
window.API_BASE_URL = API_BASE_URL;
