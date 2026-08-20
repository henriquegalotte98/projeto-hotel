// Menu lateral unico e controle de acesso visual por cargo.
(function () {
    "use strict";

    // Fonte única dos links e das permissões do menu lateral.
    // Assim, todas as telas exibem exatamente as mesmas opções para cada cargo.
    const ITENS_MENU = [
        { id: "menu-dashboard", pagina: "dashboard.html", icone: "fa-chart-pie", texto: "Visão Geral", papeis: ["ADMIN", "RECEPCIONISTA", "GOVERNANCA", "MANUTENCAO"] },
        { id: "menu-quartos", pagina: "quartos.html", icone: "fa-door-open", texto: "Quartos", papeis: ["ADMIN", "RECEPCIONISTA", "GOVERNANCA", "MANUTENCAO"] },
        { id: "menu-recepcao", pagina: "recepcao.html", icone: "fa-bell-concierge", texto: "Recepção", papeis: ["ADMIN", "RECEPCIONISTA"] },
        { id: "menu-hospedes", pagina: "hospedes.html", icone: "fa-users", texto: "Hóspedes", papeis: ["ADMIN", "RECEPCIONISTA"] },
        { id: "menu-reservas", pagina: "reservas.html", icone: "fa-calendar-check", texto: "Reservas", papeis: ["ADMIN", "RECEPCIONISTA"] },
        { id: "menu-restaurante", pagina: "restaurante.html", icone: "fa-utensils", texto: "Restaurante", papeis: ["ADMIN", "RECEPCIONISTA"] },
        { id: "menu-governanca", pagina: "governanca.html", icone: "fa-broom", texto: "Governança", papeis: ["ADMIN", "GOVERNANCA"] },
        { id: "menu-manutencao", pagina: "manutencao.html", icone: "fa-screwdriver-wrench", texto: "Manutenção", papeis: ["ADMIN", "MANUTENCAO"] },
        { id: "menu-relatorios", pagina: "relatorios.html", icone: "fa-chart-line", texto: "Relatórios", papeis: ["ADMIN"] },
        { id: "menu-usuarios", pagina: "usuarios.html", icone: "fa-users-gear", texto: "Usuários", papeis: ["ADMIN"] }
    ];

    function normalizarPapel(papel) {
        // O Spring Security pode devolver ADMIN ou ROLE_ADMIN.
        return String(papel || "").replace(/^ROLE_/, "").trim().toUpperCase();
    }

    function obterUsuarioLocal() {
        try {
            return JSON.parse(localStorage.getItem("usuarioLogado") || "null");
        } catch (erro) {
            localStorage.removeItem("usuarioLogado");
            return null;
        }
    }

    function aplicarRegrasMenu(papel) {
        const menu = document.getElementById("menu-lateral");
        if (!menu) return;

        const papelNormalizado = normalizarPapel(papel);
        const paginaAtual = location.pathname.split("/").pop() || "dashboard.html";

        // Reconstrói o menu a cada página para impedir que itens de outro
        // cargo permaneçam visíveis depois de uma navegação.
        menu.innerHTML = ITENS_MENU
            .filter(item => item.papeis.includes(papelNormalizado))
            .map(item => `
                <li id="${item.id}">
                    <a href="${item.pagina}"${item.pagina === paginaAtual ? ' class="active"' : ""}>
                        <i class="fa-solid ${item.icone}"></i> ${item.texto}
                    </a>
                </li>
            `).join("");
    }

    function inicializarMenu() {
        const usuario = obterUsuarioLocal();
        if (usuario?.papel) aplicarRegrasMenu(usuario.papel);
        configurarLogoutLateral();
    }

    function configurarLogoutLateral() {
        const lateral = document.querySelector("body > aside, body > .sidebar");
        if (!lateral) return;

        // Remove os botões antigos dos cabeçalhos. O logout deve existir
        // apenas uma vez, no rodapé do menu lateral.
        document.querySelectorAll("button").forEach(botao => {
            const texto = botao.textContent.trim().toLowerCase();
            if (texto === "sair" && !lateral.contains(botao)) botao.remove();
        });

        // Apaga qualquer rodapé legado antes de criar o componente padrão.
        lateral.querySelector(".sidebar-footer, .nav-logout")?.remove();
        const rodape = document.createElement("div");
        rodape.className = "nav-logout";
        const botao = document.createElement("button");
        botao.type = "button";
        botao.id = "btnLogoutLateral";
        botao.className = "nav-logout-button";
        botao.innerHTML = '<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i><span>Sair</span>';
        botao.addEventListener("click", encerrarSessao);
        rodape.appendChild(botao);
        lateral.appendChild(rodape);
    }

    function encerrarSessao() {
        // A limpeza local acontece mesmo se o servidor estiver indisponível.
        const finalizar = () => {
            localStorage.removeItem("usuarioLogado");
            localStorage.removeItem("token");
            location.href = "login.html";
        };
        // Invalida primeiro a sessão HTTP; finally garante o redirecionamento.
        if (typeof window.apiRequest === "function") {
            window.apiRequest("/auth/logout", "POST").catch(() => {}).finally(finalizar);
        } else {
            finalizar();
        }
    }

    window.aplicarRegrasMenu = aplicarRegrasMenu;
    window.inicializarMenu = inicializarMenu;

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", inicializarMenu);
    } else {
        inicializarMenu();
    }
})();
