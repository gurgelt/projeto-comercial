// js/budget/budgetUI.js
import { getProdutosDB } from '../state.js';
import { getOrcamento } from '../store.js';
import { calcM2Slats, needsCompItems, needsAltItems, empresasDB, kitsDB } from '../config/constants.js';
// Importações de Elementos do DOM
import {
    companyNameDisplay, companyAddressDisplay, empresaSelect, kitSelect, tableBody,
    freteTipoSelect, freteValorRow, freteValorInput, itemAltInput, itemCompInput, 
    incluirRoloCheck, itemQtdInput, itemUnidInput, itemVlrInput, itemDescInput, 
    autocompleteList,
    clienteNomeDisplay, clienteCnpjDisplay, clienteEnderecoDisplay, 
    clienteCidadeUFDisplay, clienteContatoDisplay, emailDisplay, 
    orcamentoDataDisplay,
    descontoGeralInput, subtotalDisplay, totalGeralDisplay, printSubtotal, 
    printDesconto, printFreteTipo, printFreteValor, printTotalGeral
} from '../ui/domElements.js';
import { formatCurrency, parseCurrency } from '../utils.js';

// --- Funções de Renderização ---

export function renderInfo(cliente) {
    if (!cliente) return;
    if (clienteNomeDisplay) clienteNomeDisplay.textContent = cliente.nome || '';
    if (clienteCnpjDisplay) clienteCnpjDisplay.textContent = cliente.cnpj || '';
    const enderecoCompleto = [cliente.endereco, cliente.numero, cliente.bairro].filter(Boolean).join(', ');
    if (clienteEnderecoDisplay) clienteEnderecoDisplay.textContent = enderecoCompleto;
    const cidadeUF = [cliente.cidade, cliente.estado].filter(Boolean).join(' - ');
    if (clienteCidadeUFDisplay) clienteCidadeUFDisplay.textContent = cidadeUF;
    if (clienteContatoDisplay) clienteContatoDisplay.textContent = cliente.contato || '';
    if (emailDisplay) emailDisplay.textContent = cliente.email || '';
    if (orcamentoDataDisplay && !orcamentoDataDisplay.textContent) {
        orcamentoDataDisplay.textContent = new Date().toLocaleDateString('pt-BR');
    }
}

function createRowHTML(item, index) {
    const totalItem = (item.qtd * item.vlr) * (1 - item.descPerc / 100);
    const upperName = (item.descricao || '').toUpperCase();
    
    const isCalcM2 = calcM2Slats.some(slat => upperName.includes(slat));
    const needsComp = needsCompItems.some(item => upperName.includes(item));
    const needsAlt = needsAltItems.some(item => upperName.includes(item));

    // Identifica itens que são vendidos em "kits/rolos fechados"
    const isFixedItem = [
        'BORRACHA SOLEIRA 10M', 
        'PERFIL PVC'
    ].some(fixed => upperName.includes(fixed));

    // --- LÓGICA DE BLOQUEIO ---
    const altDisabled = (!(isCalcM2 || needsAlt) || isFixedItem) ? 'disabled' : '';
    const compDisabled = (!(isCalcM2 || needsComp) || isFixedItem) ? 'disabled' : '';
    const qtyDisabled = (isCalcM2) ? 'disabled' : ''; 
    const unidDisabled = (isCalcM2 || isFixedItem) ? 'disabled' : '';
    
    const valorFormatado = item.vlr.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    
    const formatNumberInput = (num, field) => {
        const isDisabled = (field === 'comp' && compDisabled) || (field === 'alt' && altDisabled);
        if (num === 0 && isDisabled) return ''; 
        return num.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    };
    
    const qtdFormatada = item.qtd.toLocaleString('pt-BR', { minimumFractionDigits: (item.unid === 'm²' ? 2 : 0) });
    const compFormatado = formatNumberInput(item.comp, 'comp');
    const altFormatado = formatNumberInput(item.alt, 'alt');

    // ######################################################
    // ### CORREÇÃO DEFINITIVA DO BUG DE ID (011, 021...) ###
    // ######################################################
    // Usamos Number() para garantir que seja uma soma matemática (0+1=1),
    // e não uma concatenação de texto ("0"+"1"="01").
    const displayIndex = String(Number(index) + 1).padStart(3, '0'); 
    // ######################################################

    return `
        <td>${displayIndex}</td>
        <td>
            <div class="inline-autocomplete-wrapper">
                <input type="text" class="inline-desc" data-index="${index}" data-field="descricao" value="${item.descricao}" autocomplete="off">
                <ul class="autocomplete-list hidden"></ul>
            </div>
        </td>
        <td><input type="text" class="inline-input" data-field="comp" data-index="${index}" value="${compFormatado}" ${compDisabled}></td>
        <td><input type="text" class="inline-input" data-field="alt" data-index="${index}" value="${altFormatado}" ${altDisabled}></td>
        <td><input type="text" class="inline-input" data-field="qtd" data-index="${index}" value="${qtdFormatada}" ${qtyDisabled}></td>
        <td><input type="text" class="inline-input" data-field="unid" data-index="${index}" value="${item.unid}" ${unidDisabled}></td>
        <td><input type="text" class="inline-input" data-field="vlr" data-index="${index}" value="${valorFormatado}"></td>
        <td><input type="number" step="0.1" class="inline-input" data-field="descPerc" data-index="${index}" value="${item.descPerc}"></td>
        <td>${formatCurrency(totalItem)}</td>
        <td class="no-print actions-cell">
            <button class="btn-delete remove-item" title="Remover Item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </td>
    `;
}

export function renderTable(itens) {
    if (!tableBody || !itens) return; 
    tableBody.innerHTML = '';
    itens.forEach((item, index) => {
        addNewRow(item, index);
    });
}

export function addNewRow(item, index) {
    if (!tableBody) return;
    const row = document.createElement('tr');
    row.dataset.index = index;
    row.innerHTML = createRowHTML(item, index);
    tableBody.appendChild(row);
}

export function updateTableRow(item, index, options = {}) {
    if (!tableBody) return;
    const row = tableBody.querySelector(`tr[data-index="${index}"]`);
    
    if (!row) {
        console.warn(`Linha ${index} não encontrada para atualizar. Forçando re-render.`);
        renderTable(getOrcamento().itens);
        return;
    }

    const focusedField = options.focusField; 
    row.innerHTML = createRowHTML(item, index);

    if (focusedField) {
        const newTarget = row.querySelector(`[data-field="${focusedField}"]`);
        if (newTarget && !newTarget.disabled) {
            newTarget.focus();
            newTarget.select(); 
        }
    }
}

export function recalcularTudo(itens) {
    if (!itens) {
        itens = getOrcamento().itens;
    } 
    let subtotal = 0;
    itens.forEach(item => { subtotal += (item.qtd * item.vlr) * (1 - item.descPerc / 100); });
    const descontoGeral = parseCurrency(descontoGeralInput?.value) || 0;
    const valorFrete = parseCurrency(freteValorInput?.value) || 0;
    const subtotalComDesconto = subtotal * (1 - descontoGeral / 100);
    const totalGeral = subtotalComDesconto + valorFrete;
    if (subtotalDisplay) subtotalDisplay.textContent = formatCurrency(subtotal);
    if (totalGeralDisplay) totalGeralDisplay.textContent = formatCurrency(totalGeral);
    if (printSubtotal) printSubtotal.textContent = formatCurrency(subtotal);
    if (printDesconto) printDesconto.textContent = `${descontoGeral.toFixed(2)}%`;
    if (printFreteTipo && freteTipoSelect) printFreteTipo.textContent = freteTipoSelect.options[freteTipoSelect.selectedIndex]?.text || 'N/A';
    if (printFreteValor) printFreteValor.textContent = formatCurrency(valorFrete);
    if (printTotalGeral) printTotalGeral.textContent = formatCurrency(totalGeral);
}

// --- Funções de Gerenciamento da UI ---
export function popularEmpresasSelect() {
    if (!empresaSelect) return;
    empresaSelect.innerHTML = '';
    empresasDB.forEach(empresa => {
        const option = document.createElement('option');
        option.value = empresa.id;
        option.textContent = empresa.displayName;
        empresaSelect.appendChild(option);
    });
}

export function atualizarDadosEmpresa() {
    if (!empresaSelect || !companyNameDisplay || !companyAddressDisplay) return;
    const selectedId = parseInt(empresaSelect.value);
    const empresaSelecionada = empresasDB.find(emp => emp.id === selectedId);
    if (empresaSelecionada) {
        companyNameDisplay.textContent = empresaSelecionada.name;
        companyAddressDisplay.textContent = empresaSelecionada.address;
    }
}

export function popularKitsSelect() {
    if (!kitSelect) return;
    kitSelect.innerHTML = '';
    for (const key in kitsDB) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = kitsDB[key].name;
        kitSelect.appendChild(option);
    }
}

export function gerenciarEstadoFormularioItem(productName) {
    if (!itemAltInput || !itemCompInput || !incluirRoloCheck || !itemQtdInput || !itemUnidInput || !itemVlrInput) return;
    const upperName = (productName || '').toUpperCase();
    const isCalcM2 = calcM2Slats.some(slat => upperName.includes(slat));
    const needsComp = needsCompItems.some(item => upperName.includes(item));
    const needsAlt = needsAltItems.some(item => upperName.includes(item));
    const isFixedItem = ['BORRACHA SOLEIRA 10M', 'PERFIL PVC'].some(fixed => upperName.includes(fixed));

    let altDisabled = true, compDisabled = true, roloDisabled = true;
    let qtdDisabled = false, unidDisabled = false;
    let unidValue = 'un', qtdValue = '1';
    
    if (isCalcM2) {
        altDisabled = false; compDisabled = false; roloDisabled = false;
        qtdDisabled = true; unidDisabled = true;
        unidValue = 'm²'; qtdValue = '';
    } else if (needsComp) {
        compDisabled = false;
        unidDisabled = true;
        unidValue = 'm';
    } else if (needsAlt) {
        altDisabled = false;
        unidDisabled = true;
        unidValue = 'm';
    }

    if (isFixedItem) {
        altDisabled = true; compDisabled = true; qtdDisabled = false; unidDisabled = true; unidValue = 'un';
    }

    itemAltInput.disabled = altDisabled;
    itemCompInput.disabled = compDisabled;
    incluirRoloCheck.disabled = roloDisabled;
    itemQtdInput.disabled = qtdDisabled;
    itemUnidInput.disabled = unidDisabled;
    itemUnidInput.value = unidValue;
    if (!isFixedItem) itemQtdInput.value = qtdValue; 
    
    if (altDisabled) itemAltInput.value = '';
    if (compDisabled) itemCompInput.value = '';
    if (roloDisabled) incluirRoloCheck.checked = false;
}

export function calcularEAtualizarCamposPorta() {
    if (!itemDescInput || !itemAltInput || !itemCompInput || !itemQtdInput || !itemUnidInput || !incluirRoloCheck) return;
    const descricao = itemDescInput.value;
    const upperName = descricao.toUpperCase();
    const isCalcM2 = calcM2Slats.some(slat => upperName.includes(slat));
    if (!isCalcM2) return;
    let alturaM = parseCurrency(itemAltInput.value);
    let comprimentoM = parseCurrency(itemCompInput.value);
    if (isNaN(alturaM) || alturaM <= 0 || isNaN(comprimentoM) || comprimentoM <= 0) {
        itemQtdInput.value = ''; return;
    }
    let alturaFinal = alturaM;
    if (incluirRoloCheck.checked) { alturaFinal += 0.60; }
    const areaTotalM2 = alturaFinal * comprimentoM;
    itemQtdInput.value = areaTotalM2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    itemUnidInput.value = 'm²';
}

export function populateAutocompleteList(inputElement, listElement, filterFn) {
    if (!inputElement || !listElement) return;
    const query = inputElement.value.toLowerCase();
    let sourceProducts = getProdutosDB(); 
    listElement.innerHTML = ''; 
    if (filterFn) {
        sourceProducts = filterFn(sourceProducts);
    }
    const filtered = sourceProducts.filter(p => p && p.toLowerCase().includes(query));
    if (filtered.length > 0) {
        listElement.classList.remove('hidden');
        filtered.forEach(p => {
            const li = document.createElement('li');
            li.textContent = p;
            li.dataset.productName = p; 
            listElement.appendChild(li);
        });
    } else {
        listElement.classList.add('hidden');
    }
}