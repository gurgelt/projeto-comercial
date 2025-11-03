// js/main.js
import { carregarProdutos } from './api.js';
import { popularEmpresasSelect, popularKitsSelect, atualizarDadosEmpresa } from './budget/budgetUI.js';
import { setupBudgetEventListeners } from './budget/budgetEvents.js';

// --- LÓGICA DO TEMA (LIGHT/DARK) ---
function setupThemeToggle() {
    // 1. Encontra o botão único
    const toggleButton = document.getElementById('theme-toggle-btn');
    const body = document.body;
    
    if (!toggleButton) {
        console.warn("Botão de tema não encontrado.");
        return;
    }

    // 2. Aplica o tema salvo ao carregar
    const currentTheme = localStorage.getItem('theme');
    // Se o tema salvo for 'light', aplica a classe
    if (currentTheme === 'light') {
        body.classList.add('light-mode');
    } else {
        // Garante que o padrão seja escuro se não houver nada salvo
        body.classList.remove('light-mode');
    }

    // 3. Adiciona o listener de clique
    toggleButton.addEventListener('click', () => {
        // Verifica se a classe 'light-mode' está PRESENTE
        if (body.classList.contains('light-mode')) {
            // Se sim, remove (volta ao dark mode)
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            // Se não, adiciona (ativa o light mode)
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
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