// ============================================================
// DASHBOARD - Página principal
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    verificarAutenticacao();
    carregarDadosUsuario();
    carregarDashboard();
    carregarUltimasReservas();
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
// DADOS DO USUÁRIO LOGADO
// ============================================================

function carregarDadosUsuario() {
    const usuarioStr = localStorage.getItem("usuarioLogado");
    if (!usuarioStr) return;

    try {
        const usuario = JSON.parse(usuarioStr);
        
        const nomeEl = document.getElementById("usuario-nome");
        const papelEl = document.getElementById("usuario-papel");
        const avatarEl = document.getElementById("avatar-inicial");

        if (nomeEl) nomeEl.textContent = usuario.nome || "Colaborador";
        
        if (papelEl) {
            const papel = usuario.papel || "FUNCIONARIO";
            papelEl.textContent = papel;
            papelEl.className = `badge ${papel.toLowerCase()}`;
        }

        if (avatarEl && usuario.nome) {
            const iniciais = usuario.nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
            avatarEl.textContent = iniciais;
        }

        if (typeof aplicarRegrasMenu === "function") {
            aplicarRegrasMenu(usuario.papel);
        }

    } catch (e) {
        console.error("Erro ao interpretar dados do usuário logado:", e);
        fazerLogout();
    }
}

// ============================================================
// CARREGAR DADOS DO DASHBOARD (API REAL)
// ============================================================

async function carregarDashboard() {
    try {
        const dados = await apiRequest('/dashboard', 'GET');
        console.log('Dados do dashboard:', dados);
        atualizarCards(dados);
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        if (error.status === 404 || error.status === 500) {
            mostrarIndisponivel();
        }
    }
}

// ============================================================
// CARREGAR ÚLTIMAS RESERVAS (API REAL)
// ============================================================

async function carregarUltimasReservas() {
    const tbody = document.getElementById("ultimas-reservas");
    if (!tbody) return;

    try {
        // Busca as últimas 5 reservas
        const reservas = await apiRequest('/reservas', 'GET');
        console.log('Últimas reservas:', reservas);

        if (!reservas || reservas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">
                        Nenhuma reserva encontrada.
                    </td>
                </tr>
            `;
            return;
        }

        // Pega as 5 mais recentes
        const ultimas = reservas.slice(0, 5);

        tbody.innerHTML = '';
        ultimas.forEach(reserva => {
            const tr = document.createElement('tr');
            
            // Pega o nome do hóspede
            const nomeHospede = reserva.hospede?.nome || 'Hóspede não informado';
            
            // Pega o número do quarto
            const numeroQuarto = reserva.quarto?.numero || '---';
            const tipoQuarto = reserva.quarto?.tipo || '';
            const acomodacao = `${tipoQuarto} ${numeroQuarto}`.trim();
            
            // Formata a data
            const dataEntrada = reserva.dataCheckinPrevista 
                ? formatarData(reserva.dataCheckinPrevista) 
                : '---';
            
            // Status
            const status = reserva.status || 'RESERVADA';
            const statusDisplay = formatarStatusReserva(status);
            const statusClass = classeStatusReserva(status);

            tr.innerHTML = `
                <td>${nomeHospede}</td>
                <td><strong>${acomodacao}</strong></td>
                <td>${dataEntrada}</td>
                <td><span class="badge-status ${statusClass}">${statusDisplay}</span></td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Erro ao carregar últimas reservas:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #94a3b8; padding: 20px;">
                    Erro ao carregar reservas.
                </td>
            </tr>
        `;
    }
}

// ============================================================
// ATUALIZAR CARDS
// ============================================================

function atualizarCards(dados) {
    const mapeamento = [
        { id: 'quartos-ocupados', chave: 'quartosOcupados', padrao: 0 },
        { id: 'quartos-disponiveis', chave: 'quartosDisponiveis', padrao: 0 },
        { id: 'checkins-pendentes', chave: 'checkinsPendentes', padrao: 0 },
        { id: 'manutencoes', chave: 'manutencoes', padrao: 0 }
    ];

    mapeamento.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
            const valor = dados[item.chave] !== undefined ? dados[item.chave] : item.padrao;
            el.textContent = formatarNumero(valor);
        }
    });
}

// ============================================================
// FORMATAÇÕES
// ============================================================

function formatarNumero(valor) {
    if (valor === undefined || valor === null) return '0';
    return Number(valor).toLocaleString('pt-BR');
}

function formatarData(data) {
    if (!data) return '---';
    const partes = data.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return data;
}

function formatarStatusReserva(status) {
    const statusMap = {
        'RESERVADA': 'Reservado',
        'CHECKIN': 'Check-in Realizado',
        'FINALIZADA': 'Finalizado',
        'CANCELADA': 'Cancelado'
    };
    return statusMap[status] || status;
}

function classeStatusReserva(status) {
    const classMap = {
        'RESERVADA': 'status-reservado',
        'CHECKIN': 'status-ocupado',
        'FINALIZADA': 'status-disponivel',
        'CANCELADA': 'status-cancelado'
    };
    return classMap[status] || '';
}

// ============================================================
// MOSTRAR "---" QUANDO API NÃO ESTIVER DISPONÍVEL
// ============================================================

function mostrarIndisponivel() {
    const ids = ['quartos-ocupados', 'quartos-disponiveis', 'checkins-pendentes', 'manutencoes'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '---';
    });
}

// ============================================================
// LOGOUT
// ============================================================

function fazerLogout() {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

window.tratarErroAPI = function(status) {
    if (status === 401) {
        alert("Sua sessão expirou ou você não está autenticado.");
        fazerLogout();
    } else if (status === 403) {
        alert("Acesso Negado: Você não tem permissão para acessar este recurso.");
        window.location.href = "dashboard.html";
    }
};

// ============================================================
// EXPORTAÇÕES
// ============================================================
window.carregarDashboard = carregarDashboard;
window.carregarUltimasReservas = carregarUltimasReservas;