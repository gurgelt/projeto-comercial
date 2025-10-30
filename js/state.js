// js/state.js

// --- Dados Principais ---
export const orcamento = {
    cliente: { nome: '', cnpj: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', contato: '', email: '' },
    tipoCliente: null,
    itens: []
};

let _produtosDB = []; // Variável interna para a lista de produtos

export let lastCalculatedDimensions = { altura: 0, comprimento: 0, totalLaminas: 0 };

// --- Constantes de Regras ---
export const calcM2Slats = [
    '1/2 CANA GALVANIZADA (FECHADA)',
    '1/2 CANA TRANSVISION (FURADA)',
    'SUPER CANA'
];
export const needsCompItems = [
    'TUBO OCTAGONAL',
    'SOLEIRA'
];
export const needsAltItems = [
    'GUIA LATERAL'
];

// --- Constantes de Configuração ---
export const empresasDB = [
    { id: 1, displayName: 'ATROX - SP', name: 'ATROX', address: 'Rua Mafra 375, Ipiranga - São Paulo/SP' },
    { id: 2, displayName: 'ATROX - MG', name: 'ATROX', address: 'Rua Presidente Getúlio Vargas 3765 - Itapeva/MG' },
    { id: 3, displayName: 'ATRON - SP', name: 'ATRON', address: 'Rua Mafra 375, Ipiranga - São Paulo/SP' },
    { id: 4, displayName: 'ATRON - MG', name: 'ATRON', address: 'Rua Presidente Getúlio Vargas 3765 - Itapeva/MG' }
];
export const kitsDB = {
    'todos': { name: '-- Sem Filtro de Kit --', keywords: [], items: [] },
    'comum': { name: 'Kit 1 - Porta Comum', keywords: ['CANA', 'GUIA', 'SOLEIRA', 'EIXO', 'TUBO', 'TRAVA'], items: ['GUIA LATERAL 50', 'SOLEIRA', 'TUBO OCTAGONAL'] },
    'auto': { name: 'Kit 2 - Porta Automatizada', keywords: ['CANA', 'GUIA', 'SOLEIRA', 'MOTOR', 'AC', 'DC', 'CHAPA', 'CENTRAL', 'NOBREAK', 'CONTROLE', 'BOTOEIRA'], items: ['GUIA LATERAL 50', 'SOLEIRA', 'AC200J', 'Controle de Comando'] }
};

// --- Getters e Setters para produtosDB ---
export function getProdutosDB() {
    return [..._produtosDB]; // Retorna cópia
}
export function setProdutosDB(newProducts) {
    if (Array.isArray(newProducts)) {
        _produtosDB = [...newProducts];
        console.log("Estado produtosDB atualizado:", _produtosDB);
    } else {
        console.error("setProdutosDB recebeu dados inválidos:", newProducts);
        _produtosDB = ['Erro ao carregar dados'];
    }
}

// --- Seletores do DOM Exportados ---
// Views Principais
export const startScreen = document.getElementById('start-screen');
export const mainContent = document.getElementById('main-content'); // Orçamento View
export const producaoView = document.getElementById('producao-view'); // Produção View

// Elementos Comuns e do Orçamento
export const orcamentoModal = document.getElementById('orcamento-modal');
export const editOrcamentoModal = document.getElementById('edit-orcamento-modal');
export const clienteForm = document.getElementById('cliente-form');
export const itemForm = document.getElementById('item-form');
export const editOrcamentoForm = document.getElementById('edit-orcamento-form');
export const tableBody = document.getElementById('orcamento-table-body');
export const freteTipoSelect = document.getElementById('frete-tipo');
export const freteValorRow = document.getElementById('frete-valor-row');
export const freteValorInput = document.getElementById('frete-valor');
export const empresaSelect = document.getElementById('empresa-select');
export const companyNameDisplay = document.getElementById('company-name');
export const companyAddressDisplay = document.getElementById('company-address');
export const clienteInputs = { nome: document.getElementById('cliente-nome'), cnpj: document.getElementById('cliente-cnpj'), endereco: document.getElementById('cliente-endereco'), numero: document.getElementById('cliente-numero'), bairro: document.getElementById('cliente-bairro'), cidade: document.getElementById('cliente-cidade'), estado: document.getElementById('cliente-estado'), cep: document.getElementById('cliente-cep'), contato: document.getElementById('cliente-contato'), email: document.getElementById('cliente-email') };
export const btnAddInlineRow = document.getElementById('add-inline-row-btn');
export const btnAddItemModal = document.getElementById('add-item-btn');

// Elementos do Modal de Item
export const itemDescInput = document.getElementById('item-desc');
export const autocompleteList = document.getElementById('autocomplete-list');
export const itemAltInput = document.getElementById('item-alt');
export const itemCompInput = document.getElementById('item-comp');
export const incluirRoloCheck = document.getElementById('incluir-rolo-check');
export const voltarBtn = document.getElementById('voltar-btn');
export const itemQtdInput = document.getElementById('item-qtd');
export const itemUnidInput = document.getElementById('item-unid');
export const itemVlrInput = document.getElementById('item-vlr');
export const kitSelect = document.getElementById('kit-select');

// --- CORREÇÃO: Seletores da View de Produção ---
export const producaoTableBody = document.getElementById('producao-table-body');
export const btnVoltarOrcamento = document.getElementById('voltar-orcamento-btn');