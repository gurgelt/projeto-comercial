// js/production/productionEvents.js
import { showBudgetView } from '../navigation.js'; // Importa a função de navegação

export function setupProductionEventListeners() {
    let voltarBtn = document.getElementById('voltar-orcamento-btn');
    if (voltarBtn) {
        // Remove listener antigo para evitar duplicação se setup for chamado mais de uma vez
        voltarBtn.removeEventListener('click', showBudgetView);
        // Adiciona o listener
        voltarBtn.addEventListener('click', showBudgetView);
    }

    // Adicionar outros listeners da tela de produção aqui, se houver no futuro
    
}