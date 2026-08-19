document.addEventListener('DOMContentLoaded', () => {
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (!usuarioSalvo) return;

    try {
        const usuario = JSON.parse(usuarioSalvo);
        const papelPermitido = usuario.papel === 'ADMIN' || usuario.papel === 'RECEPCIONISTA';

        if (!papelPermitido) {
            alert('Acesso negado. O Restaurante está disponível apenas para administradores e recepcionistas.');
            window.location.href = 'dashboard.html';
        }
    } catch (_error) {
        window.location.href = 'login.html';
    }
});
