// js/main.js
import { carregarProdutos } from './api.js';
import { popularEmpresasSelect, popularKitsSelect, atualizarDadosEmpresa } from './budget/budgetUI.js';
import { setupBudgetEventListeners } from './budget/budgetEvents.js';

// --- NOSSAS NOVAS IMPORTAÇÕES ---
import { showBudgetView } from './navigation.js';
import { 
    themeToggleButton,
    producaoView // Importa o container da view de produção
} from './ui/domElements.js'; 
// --- FIM DAS NOVAS IMPORTAÇÕES ---

// --- LÓGICA DO TEMA (Refatorada) ---
function setupThemeToggle() {
    const body = document.body;
    
    // 1. USA O SELETOR IMPORTADO
    if (!themeToggleButton) {
        console.warn("Botão de tema não encontrado.");
        return;
    }

    // 2. Aplica o tema salvo ao carregar
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
    }

    // 3. Adiciona o listener de clique
    themeToggleButton.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
        }
    });
}
// --- FIM DA LÓGICA DO TEMA ---


// --- NOVO: DELEGAÇÃO DE EVENTOS ---
function setupGlobalEventListeners() {
    
    // Delegação de Eventos da View de Produção
    if (producaoView) {
        producaoView.addEventListener('click', (event) => {
            
            // Verifica se o clique foi no botão "voltar"
            if (event.target.closest('#voltar-orcamento-btn')) {
                showBudgetView();
            }

            // (Outros cliques da tela de produção podem ser tratados aqui)
            // if (event.target.closest('.btn-imprimir-prod')) { ... }
        });
    }
}
// --- FIM DA DELEGAÇÃO ---


async function init() {
    console.log("Iniciando aplicação...");
    
    setupThemeToggle(); // Configura o tema
    
    await carregarProdutos(); // Carrega os dados
    
    // Configura a UI inicial (Budget)
    popularEmpresasSelect();
    atualizarDadosEmpresa();
    popularKitsSelect();
    
    // Configura TODOS os listeners
    setupBudgetEventListeners();   // Configura eventos do orçamento
    setupGlobalEventListeners(); // Configura a delegação de eventos (Produção)
    
    console.log("Aplicação inicializada!");
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);