import { carregarProdutos } from './api.js';
import { popularEmpresasSelect, popularKitsSelect, atualizarDadosEmpresa } from './budget/budgetUI.js';
import { setupBudgetEventListeners } from './budget/budgetEvents.js';
// Não precisamos importar productionEvents aqui, ele será chamado pela navegação

async function init() {
    console.log("Iniciando aplicação...");
    await carregarProdutos(); // Carrega os dados primeiro
    popularEmpresasSelect();
    atualizarDadosEmpresa(); // Chama a função importada
    popularKitsSelect();
    setupBudgetEventListeners();   // Configura todos os eventos iniciais (do orçamento)
    console.log("Aplicação inicializada!");
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);