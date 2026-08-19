document.addEventListener('DOMContentLoaded', () => {
    // 1. Validação de Acesso (Seu código original)
    const usuarioStr = localStorage.getItem('usuarioLogado');
    if (!usuarioStr) return;

    try {
        const usuario = JSON.parse(usuarioStr);
        if (usuario.papel !== 'ADMIN' && usuario.papel !== 'MANUTENCAO') {
            alert('Acesso negado. Apenas administradores e profissionais de manutenção podem acessar esta página.');
            window.location.href = 'dashboard.html';
            return;
        }
    } catch (_error) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Inicialização dos eventos e carregamento de dados da Sprint 5
    carregarChamados();

    const form = document.getElementById('form-chamado');
    if (form) {
        form.addEventListener('submit', criarChamado);
    }

    const btnFecharModal = document.getElementById('btn-fechar-modal');
    if (btnFecharModal) {
        btnFecharModal.addEventListener('click', fecharModal);
    }
});

// ABERTURA DE CHAMADO
async function criarChamado(e) {
    e.preventDefault();

    const dados = {
        quartoId: document.getElementById('quartoId').value,
        descricao: document.getElementById('descricao').value,
        prioridade: document.getElementById('prioridade').value
    };

    try {
        const resposta = await fetch('/api/manutencao', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (resposta.ok) {
            alert('Chamado aberto com sucesso!');
            document.getElementById('form-chamado').reset();
            carregarChamados();
        } else {
            alert('Erro ao abrir o chamado.');
        }
    } catch (erro) {
        console.error('Erro na requisição:', erro);
    }
}

// PAINEL POR STATUS (KANBAN)
async function carregarChamados() {
    try {
        const resposta = await fetch('/api/manutencao');
        if (!resposta.ok) return;

        const chamados = await resposta.json();

        const colPendente = document.getElementById('lista-PENDENTE');
        const colAndamento = document.getElementById('lista-EM_ANDAMENTO');
        const colConcluido = document.getElementById('lista-CONCLUIDO');

        if (colPendente) colPendente.innerHTML = '';
        if (colAndamento) colAndamento.innerHTML = '';
        if (colConcluido) colConcluido.innerHTML = '';

        chamados.forEach(chamado => {
            const card = document.createElement('div');
            card.className = 'chamado-card';
            card.innerHTML = `
                <strong>Quarto/Local:</strong> ${chamado.quartoId}<br>
                <p>${chamado.descricao}</p>
                <small>Prioridade: ${chamado.prioridade}</small><br>
                <button onclick="verHistorico(${chamado.id})">Ver Histórico</button>
            `;

            const coluna = document.getElementById(`lista-${chamado.status}`);
            if (coluna) {
                coluna.appendChild(card);
            }
        });
    } catch (erro) {
        console.error('Erro ao carregar chamados:', erro);
    }
}

// HISTÓRICO DO CHAMADO
async function verHistorico(chamadoId) {
    try {
        const resposta = await fetch(`/api/manutencao/${chamadoId}`);
        const chamado = await resposta.json();

        document.getElementById('historico-id').innerText = `#${chamado.id}`;
        document.getElementById('historico-quarto').innerText = chamado.quartoId;
        document.getElementById('historico-descricao').innerText = chamado.descricao;

        const listaHistorico = document.getElementById('lista-historico-status');
        listaHistorico.innerHTML = '';

        if (chamado.historico && chamado.historico.length > 0) {
            chamado.historico.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${item.status}</strong> em ${new Date(item.dataAlteracao).toLocaleString()}`;
                listaHistorico.appendChild(li);
            });
        } else {
            listaHistorico.innerHTML = '<li>Sem histórico de alterações disponível.</li>';
        }

        document.getElementById('modal-historico').classList.remove('hidden');
    } catch (erro) {
        console.error('Erro ao buscar histórico:', erro);
    }
}

function fecharModal() {
    document.getElementById('modal-historico').classList.add('hidden');
}