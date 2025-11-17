import { getOrcamento } from './store.js'; // Importa o getter do store
// import { orcamento } from './state.js'; // Remove import direto do state
// ######################################################

import { mainContent, producaoView } from './ui/domElements.js';
import { renderProductionView } from './production/productionUI.js';
// import { setupProductionEventListeners } from './production/productionEvents.js'; // Importação removida
import { setupBudgetEventListeners } from './budget/budgetEvents.js';

export function showBudgetView() {
    producaoView.classList.add('hidden');
    mainContent.classList.remove('hidden');
    console.log("Mostrando view do Orçamento");
}

export function showProductionView() {
    // ######################################################
    // ### MUDANÇA (Lógica) ###
    // ######################################################
    const orcamentoAtual = getOrcamento(); // Usa o getter do store

    if (orcamentoAtual.itens.length === 0) {
    // ######################################################
        alert("Adicione itens ao orçamento antes de gerar o pedido.");
        return;
    }
    mainContent.classList.add('hidden');
    producaoView.classList.remove('hidden');
    
    // ######################################################
    renderProductionView(orcamentoAtual); // Passa o estado atual do store
    
    // setupProductionEventListeners(); // LINHA REMOVIDA (Evento agora é tratado por delegação no main.js)
    // ######################################################
    
    console.log("Mostrando view de Produção");
}