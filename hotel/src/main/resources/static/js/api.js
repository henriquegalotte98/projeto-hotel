// ============================================================
// API - Comunicação com o Back-end
// ============================================================

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Função genérica para fazer requisições HTTP
 * @param {string} endpoint - Endpoint da API (ex: '/usuarios')
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {object} body - Dados para enviar no corpo (opcional)
 * @returns {Promise} - Resposta da API já parseada
 */
async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include' // Envia cookies de sessão
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        // Tenta parsear a resposta como JSON
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Se a resposta não for OK (2xx), lança erro
        if (!response.ok) {
            const errorMessage = data?.message || data || 'Erro na requisição';
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;

    } catch (error) {
        // Erro de rede ou parse
        if (!error.status) {
            error.message = 'Erro de conexão com o servidor. Verifique se o back-end está rodando.';
        }
        throw error;
    }
}

// ============================================================
// EXPORTA FUNÇÕES PARA USO GLOBAL
// ============================================================
window.apiRequest = apiRequest;
window.API_BASE_URL = API_BASE_URL;