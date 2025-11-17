// js/store.js
import { orcamento as orcamentoInicial } from './state.js';

let _orcamento = orcamentoInicial;

function notify(action, payload) {
    const event = new CustomEvent('stateChanged', { 
        detail: { action, payload } 
    });
    document.dispatchEvent(event);
}

// --- Getters ---
export function getOrcamento() {
    return JSON.parse(JSON.stringify(_orcamento));
}
export function getOrcamentoItens() {
    return JSON.parse(JSON.stringify(_orcamento.itens));
}
export function getOrcamentoNumeroData() {
    return {
        numero: _orcamento.numero,
        data: _orcamento.data
    };
}

// ######################################################
// ### MUDANÇA (Getters) ###
// ######################################################
// Getter adicionado para desacoplamento (usado pela api.js)
export function getTipoCliente() {
    return _orcamento.tipoCliente;
}
// ######################################################


// --- Mutators ---
export function setTipoCliente(tipo) {
    _orcamento.tipoCliente = tipo;
}
export function setClientInfo(clienteData) {
    _orcamento.cliente = { ..._orcamento.cliente, ...clienteData };
    notify('clientInfoUpdated', { cliente: _orcamento.cliente });
}
export function setOrcamentoInfo(numero, data) {
    _orcamento.numero = numero;
    _orcamento.data = data;
}

export function addItemToBudget(item, options = {}) {
    _orcamento.itens.push(item);
    const index = _orcamento.itens.length - 1;
    notify('itemAdded', { item, index, options });
    notify('recalculateTotals', { itens: _orcamento.itens });
}

/**
 * Atualiza um item e aceita opções de foco
 * @param {number} index - Índice do item
 * @param {object} item - Objeto do item
 * @param {object} options - Opções (ex: { focusField: 'comp' })
 */
export function updateItemCompleto(index, item, options = {}) {
    if (!_orcamento.itens[index]) return;
    _orcamento.itens[index] = item;
    
    // Passa as 'options' para o "grito"
    notify('itemUpdated', { item, index, options }); 
    notify('recalculateTotals', { itens: _orcamento.itens });
}

export function removeItemFromBudget(index) {
    if (index === undefined || !_orcamento.itens[index]) return;
    _orcamento.itens.splice(index, 1);
    notify('fullRender', { 
        itens: _orcamento.itens, 
        cliente: _orcamento.cliente 
    });
    notify('recalculateTotals', { itens: _orcamento.itens });
}

export function setItens(items) {
    _orcamento.itens = items;
    notify('fullRender', { 
        itens: _orcamento.itens, 
        cliente: _orcamento.cliente 
    });
}