// ============================================================
// API - Comunicação com o Back-end
// ============================================================

const API_BASE_URL = 'http://localhost:8080/api';

async function apiRequest(endpoint, method = 'GET', body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include'
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            const errorMessage = data?.message || data || 'Erro na requisição';
            const error = new Error(errorMessage);
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;

    } catch (error) {
        if (!error.status) {
            error.message = 'Erro de conexão com o servidor. Verifique se o back-end está rodando.';
        }
        throw error;
    }
}

window.apiRequest = apiRequest;
window.API_BASE_URL = API_BASE_URL;