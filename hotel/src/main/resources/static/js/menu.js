// ============================================================
// MENU - Controle de navegação e permissões
// ============================================================

// ===== DESTACAR LINK ATIVO =====
const pagina = location.pathname.split("/").pop() || "dashboard.html";
document.querySelectorAll(".menu a").forEach((link) => {
    if (link.getAttribute("href") === pagina) link.classList.add("active");
});

// ===== CONFIRMAÇÃO DE AÇÕES =====
document.querySelectorAll("[data-confirmar]").forEach((botao) =>
    botao.addEventListener("click", () => {
        if (confirm(botao.dataset.confirmar))
            alert("Operação realizada com sucesso.");
    })
);

// ===== DEMO FORM =====
document.querySelectorAll("form[data-demo]").forEach((form) =>
    form.addEventListener("submit", (evento) => {
        evento.preventDefault();
        const mensagem =
            form.querySelector(".mensagem") || document.querySelector(".mensagem");
        if (mensagem) {
            mensagem.textContent = "Dados salvos com sucesso!";
            mensagem.classList.add("visivel");
        }
        form.reset();
    })
);

// ===== LOGOUT =====
document.querySelector("[data-logout]")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioLogado");
    location.href = "login.html";
});

// ============================================================
// FUNÇÃO PARA CONTROLAR MENU POR PAPEL (NOVO)
// ============================================================

/**
 * Aplica regras de visibilidade do menu baseado no papel do usuário
 * @param {string} papel - Papel do usuário (ADMIN, RECEPCIONISTA, etc.)
 */
function aplicarRegrasMenu(papel) {
    // Menu de Usuários - só aparece para ADMIN
    const menuUsuarios = document.getElementById('menu-usuarios');
    if (menuUsuarios) {
        if (papel === 'ADMIN') {
            menuUsuarios.style.display = 'block';
        } else {
            menuUsuarios.style.display = 'none';
        }
    }

    // Adicione outras regras aqui conforme necessário
    // Exemplo:
    // const menuGovernanca = document.getElementById('menu-governanca');
    // if (menuGovernanca) {
    //     menuGovernanca.style.display = (papel === 'ADMIN' || papel === 'GOVERNANCA') ? 'block' : 'none';
    // }
}

// ============================================================
// EXPORTA PARA USO GLOBAL
// ============================================================
window.aplicarRegrasMenu = aplicarRegrasMenu;