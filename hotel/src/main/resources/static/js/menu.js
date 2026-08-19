// ============================================================
// MENU - Controle de navegação e permissões (Front-End)
// ============================================================

// ============================================================
// DESTACAR LINK ATIVO - CORRIGIDO (NUNCA MARCA DOIS)
// ============================================================

// Pega o nome da página atual (ex: dashboard.html, quartos.html)
const pagina = location.pathname.split("/").pop() || "dashboard.html";

// Seleciona todos os links do menu lateral
const linksMenu = document.querySelectorAll(".menu a");

// PASSO 1: Remove a classe 'active' de TODOS os links (garante limpeza)
linksMenu.forEach(link => link.classList.remove("active"));

// PASSO 2: Adiciona a classe 'active' apenas no link que corresponde à página atual
linksMenu.forEach(link => {
    if (link.getAttribute("href") === pagina || link.getAttribute("href") === "/html/" + pagina) {
        link.classList.add("active");
    }
});

// ============================================================
// CONTROLE DE MENU POR PAPEL
// ============================================================

/**
 * Aplica regras de visibilidade do menu baseado no papel do usuário
 * @param {string} papel - Papel do usuário (ADMIN, RECEPCIONISTA, GOVERNANCA, MANUTENCAO)
 */
function aplicarRegrasMenu(papel) {
    if (!papel) return;

    // REGRA DE NEGÓCIO CLARA:
    // ADMIN vê tudo. Os outros só veem o que é deles.
    const permissoesMenu = {
        // ADMIN vê TUDO
        'menu-usuarios': ['ADMIN'],
        'menu-relatorios': ['ADMIN'],
        
        // RECEPCIONISTA vê Recepção, Hóspedes, Reservas e Restaurante
        'menu-recepcao': ['ADMIN', 'RECEPCIONISTA'],
        'menu-hospedes': ['ADMIN', 'RECEPCIONISTA'],
        'menu-reservas': ['ADMIN', 'RECEPCIONISTA'],
        'menu-restaurante': ['ADMIN', 'RECEPCIONISTA'],
        
        // GOVERNANÇA vê Governança
        'menu-governanca': ['ADMIN', 'GOVERNANCA'],
        
        // MANUTENÇÃO vê Manutenção
        'menu-manutencao': ['ADMIN', 'MANUTENCAO'],
        
        // TODOS veem Dashboard e Quartos
        'menu-dashboard': ['ADMIN', 'RECEPCIONISTA', 'GOVERNANCA', 'MANUTENCAO'],
        'menu-quartos': ['ADMIN', 'RECEPCIONISTA', 'GOVERNANCA', 'MANUTENCAO']
    };

    // Aplica as regras: esconde ou mostra os itens do menu
    for (const [id, papeisPermitidos] of Object.entries(permissoesMenu)) {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (papeisPermitidos.includes(papel)) {
                elemento.style.display = 'block'; // ou 'flex' dependendo do CSS
            } else {
                elemento.style.display = 'none';
            }
        }
    }
}

// ============================================================
// EXPORTA PARA USO GLOBAL (para ser chamado no dashboard.js)
// ============================================================

window.aplicarRegrasMenu = aplicarRegrasMenu;