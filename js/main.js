// js/main.js
import { carregarProdutos } from './api.js';
import { popularEmpresasSelect, popularKitsSelect, atualizarDadosEmpresa } from './budget/budgetUI.js';
import { setupBudgetEventListeners } from './budget/budgetEvents.js';

// --- LÓGICA DO TEMA (LIGHT/DARK) ---
function setupThemeToggle() {
    const toggles = document.querySelectorAll('.theme-toggle-input'); // Pega AMBOS os toggles
    const body = document.body;
    const currentTheme = localStorage.getItem('theme');

    // 1. Aplica o tema salvo (se houver)
    if (currentTheme === 'light') {
        body.classList.add('light-mode');
        toggles.forEach(toggle => { if(toggle) toggle.checked = true; }); // Marca ambos os checkboxes
    }

    // 2. Adiciona listener para CADA toggle
    toggles.forEach(toggle => {
        if (!toggle) return;
        toggle.addEventListener('change', () => {
            let isChecked = toggle.checked;

            if (isChecked) {
                body.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            } else {
                body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark');
            }
            
            // Sincroniza o outro toggle para que tenham o mesmo estado
            toggles.forEach(t => { if (t) t.checked = isChecked; });
        });
    });
}
// --- FIM DA LÓGICA DO TEMA ---


async function init() {
    console.log("Iniciando aplicação...");
    
    // Configura o tema ANTES de tudo para evitar "flash"
    setupThemeToggle(); 
    
    await carregarProdutos(); // Carrega os dados primeiro
    popularEmpresasSelect();
    atualizarDadosEmpresa(); // Chama a função importada
    popularKitsSelect();
    setupBudgetEventListeners();   // Configura todos os eventos iniciais (do orçamento)
    
    console.log("Aplicação inicializada!");
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);