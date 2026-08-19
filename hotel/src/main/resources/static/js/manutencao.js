document.addEventListener('DOMContentLoaded', () => {
    const usuarioStr = localStorage.getItem('usuarioLogado');
    if (!usuarioStr) return;

    try {
        const usuario = JSON.parse(usuarioStr);
        if (usuario.papel !== 'ADMIN' && usuario.papel !== 'MANUTENCAO') {
            alert('Acesso negado. Apenas administradores e profissionais de manutenção podem acessar esta página.');
            window.location.href = 'dashboard.html';
        }
    } catch (_error) {
        window.location.href = 'login.html';
    }
});
