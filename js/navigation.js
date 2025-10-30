import { mainContent, producaoView, orcamento } from './state.js';
import { renderProductionView } from './production/productionUI.js';
import { setupProductionEventListeners } from './production/productionEvents.js';
import { setupBudgetEventListeners } from './budget/budgetEvents.js';
// Importar setupBudgetEventListeners se precisar reativar eventos específicos  
export function showBudgetView() {
    producaoView.classList.add('hidden');
    mainContent.classList.remove('hidden');
    console.log("Mostrando view do Orçamento");
    // Se necessário, reativar/atualizar algo na UI do orçamento ao voltar
    // setupBudgetEventListeners(); // Talvez não seja necessário reativar tudo
}

export function showProductionView() {
    if (orcamento.itens.length === 0) {
        alert("Adicione itens ao orçamento antes de gerar o pedido.");
        return;
    }
    mainContent.classList.add('hidden');
    producaoView.classList.remove('hidden');
    renderProductionView(orcamento); // Passa o estado atual do orçamento
    setupProductionEventListeners(); // Configura eventos da tela de produção
    console.log("Mostrando view de Produção");
}