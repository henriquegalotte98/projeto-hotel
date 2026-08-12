// js/dashboard.js

document.addEventListener("DOMContentLoaded", () => {
    verificarAutenticacao();
    carregarDadosUsuario();
});

function verificarAutenticacao() {
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
        window.location.href = "login.html";
    }
}

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