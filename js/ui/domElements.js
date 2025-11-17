// js/ui/domElements.js

// --- Views Principais ---
export const startScreen = document.getElementById('start-screen');
export const mainContent = document.getElementById('main-content');
export const producaoView = document.getElementById('producao-view');
export const themeToggleButton = document.getElementById('theme-toggle-btn');

// --- Modais ---
export const clientTypeModal = document.getElementById('client-type-modal');
export const orcamentoModal = document.getElementById('orcamento-modal');
export const editOrcamentoModal = document.getElementById('edit-orcamento-modal');

// --- Formulários ---
export const clienteForm = document.getElementById('cliente-form');
export const itemForm = document.getElementById('item-form');
export const editOrcamentoForm = document.getElementById('edit-orcamento-form');

// --- Elementos do Orçamento (Header e Ações) ---
export const empresaSelect = document.getElementById('empresa-select');
export const companyNameDisplay = document.getElementById('company-name');
export const companyAddressDisplay = document.getElementById('company-address');
export const orcamentoNumDisplay = document.getElementById('orcamento-num-display');
export const orcamentoDataDisplay = document.getElementById('orcamento-data-display');
export const btnAddInlineRow = document.getElementById('add-inline-row-btn');
export const btnAddItemModal = document.getElementById('add-item-btn');
// export const btnGerarPedido = document.getElementById('gerar-pedido-btn'); // (Comentado pois é criado dinamicamente)

// --- Elementos do Cliente (Display e Inputs) ---
export const clienteNomeDisplay = document.getElementById('cliente-nome-display');
export const clienteCnpjDisplay = document.getElementById('cliente-cnpj-display');
export const clienteEnderecoDisplay = document.getElementById('cliente-endereco-display');
export const clienteCidadeUFDisplay = document.getElementById('cliente-cidade-uf-display');
export const clienteContatoDisplay = document.getElementById('cliente-contato-display');
export const emailDisplay = document.getElementById('cliente-email-display'); // <-- A LINHA QUE FALTAVA
export const clienteInputs = { 
    nome: document.getElementById('cliente-nome'), 
    cnpj: document.getElementById('cliente-cnpj'), 
    endereco: document.getElementById('cliente-endereco'), 
    numero: document.getElementById('cliente-numero'), 
    bairro: document.getElementById('cliente-bairro'), 
    cidade: document.getElementById('cliente-cidade'), 
    estado: document.getElementById('cliente-estado'), 
    cep: document.getElementById('cliente-cep'), 
    contato: document.getElementById('cliente-contato'), 
    email: document.getElementById('cliente-email') 
};

// --- Elementos do Modal de Item ---
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
export const itemDescPercInput = document.getElementById('item-desc-perc');
export const modalStep1 = document.getElementById('modal-step-1');
export const modalStep2 = document.getElementById('modal-step-2');

// --- Elementos do Modal de Edição (Orçamento) ---
export const editOrcamentoNumInput = document.getElementById('orcamento-num-edit');
export const editOrcamentoDataInput = document.getElementById('orcamento-data-edit');

// --- Elementos da Tabela e Totais (Orçamento) ---
export const tableBody = document.getElementById('orcamento-table-body');
export const freteTipoSelect = document.getElementById('frete-tipo');
export const freteValorRow = document.getElementById('frete-valor-row');
export const freteValorInput = document.getElementById('frete-valor');
export const descontoGeralInput = document.getElementById('desconto-geral');
export const subtotalDisplay = document.getElementById('subtotal');
export const totalGeralDisplay = document.getElementById('total-geral');
export const printSubtotal = document.getElementById('print-subtotal');
export const printDesconto = document.getElementById('print-desconto');
export const printFreteTipo = document.getElementById('print-frete-tipo');
export const printFreteValor = document.getElementById('print-frete-valor');
export const printTotalGeral = document.getElementById('print-total-geral');

// --- Elementos da View de Produção ---
export const producaoTableBody = document.getElementById('producao-table-body');
export const btnVoltarOrcamento = document.getElementById('voltar-orcamento-btn');
export const prodPedidoNumEl = document.getElementById('prod-pedido-num');
export const prodClienteNomeEl = document.getElementById('prod-cliente-nome');
export const prodClienteContatoEl = document.getElementById('prod-cliente-contato');
export const prodDataPedidoEl = document.getElementById('prod-data-pedido');
export const prodVendedorNomeEl = document.getElementById('prod-vendedor-nome');