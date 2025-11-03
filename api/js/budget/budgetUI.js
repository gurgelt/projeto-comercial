// js/budget/budgetUI.js
import {
    orcamento, calcM2Slats, needsCompItems, needsAltItems,
    empresasDB, kitsDB, companyNameDisplay, companyAddressDisplay,
    empresaSelect, kitSelect, tableBody, freteTipoSelect, freteValorInput,
    itemAltInput, itemCompInput, incluirRoloCheck, itemQtdInput, itemUnidInput, itemVlrInput,
    getProdutosDB, // <--- Importa o getter de produtos
    itemDescInput // <--- Importa o seletor (corrigido anteriormente)
} from '../state.js';
import { formatCurrency, parseCurrency } from '../utils.js';
import { buscarPrecoProduto } from '../api.js'; // <--- Importa a função da API

// --- Funções de Renderização ---

export function renderInfo() {
    // Garante que os elementos existem antes de tentar acessá-los
    const nomeDisplay = document.getElementById('cliente-nome-display');
    const cnpjDisplay = document.getElementById('cliente-cnpj-display');
    const enderecoDisplay = document.getElementById('cliente-endereco-display');
    const cidadeUFDisplay = document.getElementById('cliente-cidade-uf-display');
    const contatoDisplay = document.getElementById('cliente-contato-display');
    const emailDisplay = document.getElementById('cliente-email-display');
    const dataDisplay = document.getElementById('orcamento-data-display');

    if (nomeDisplay) nomeDisplay.textContent = orcamento.cliente.nome || '';
    if (cnpjDisplay) cnpjDisplay.textContent = orcamento.cliente.cnpj || '';
    const enderecoCompleto = [orcamento.cliente.endereco, orcamento.cliente.numero, orcamento.cliente.bairro].filter(Boolean).join(', ');
    if (enderecoDisplay) enderecoDisplay.textContent = enderecoCompleto;
    const cidadeUF = [orcamento.cliente.cidade, orcamento.cliente.estado].filter(Boolean).join(' - ');
    if (cidadeUFDisplay) cidadeUFDisplay.textContent = cidadeUF;
    if (contatoDisplay) contatoDisplay.textContent = orcamento.cliente.contato || '';
    if (emailDisplay) emailDisplay.textContent = orcamento.cliente.email || '';
    if (dataDisplay && !dataDisplay.textContent) {
        dataDisplay.textContent = new Date().toLocaleDateString('pt-BR');
    }
}

export function renderTable() {
    if (!tableBody) return; // Proteção se o elemento não existir
    tableBody.innerHTML = '';
    orcamento.itens.forEach((item, index) => {
        const totalItem = (item.qtd * item.vlr) * (1 - item.descPerc / 100);
        const row = document.createElement('tr');
        row.dataset.index = index;

        const upperName = (item.descricao || '').toUpperCase();
        const isCalcM2 = calcM2Slats.some(slat => upperName.includes(slat));
        const needsComp = needsCompItems.some(item => upperName.includes(item));
        const needsAlt = needsAltItems.some(item => upperName.includes(item));

        const altDisabled = !(isCalcM2 || needsAlt) ? 'disabled' : '';
        const compDisabled = !(isCalcM2 || needsComp) ? 'disabled' : '';
        const qtyUnidDisabled = isCalcM2 ? 'disabled' : '';

        row.innerHTML += `<td>${String(index + 1).padStart(3, '0')}</td>`;
        row.innerHTML += `
            <td>
                <div class="inline-autocomplete-wrapper">
                    <input type="text" class="inline-desc" data-index="${index}" value="${item.descricao}" autocomplete="off">
                    <ul class="autocomplete-list hidden"></ul>
                </div>
            </td>
        `;
        row.innerHTML += `<td><input type="number" step="0.01" class="inline-input" data-field="comp" data-index="${index}" value="${item.comp}" ${compDisabled}></td>`;
        row.innerHTML += `<td><input type="number" step="0.01" class="inline-input" data-field="alt" data-index="${index}" value="${item.alt}" ${altDisabled}></td>`;
        row.innerHTML += `<td><input type="number" step="0.01" class="inline-input" data-field="qtd" data-index="${index}" value="${item.qtd}" ${qtyUnidDisabled}></td>`;
        row.innerHTML += `<td><input type="text" class="inline-input" data-field="unid" data-index="${index}" value="${item.unid}" ${qtyUnidDisabled}></td>`;
        const valorFormatado = item.vlr.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        row.innerHTML += `<td><input type="text" class="inline-input" data-field="vlr" data-index="${index}" value="${valorFormatado}"></td>`;
        row.innerHTML += `<td><input type="number" step="0.1" class="inline-input" data-field="descPerc" data-index="${index}" value="${item.descPerc}"></td>`;
        row.innerHTML += `<td>${formatCurrency(totalItem)}</td>`;
        row.innerHTML += `
            <td class="no-print actions-cell">
                <button class="btn-delete remove-item" title="Remover Item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
    recalcularTudo(); // Chama o recálculo após renderizar
}

export function recalcularTudo() {
    let subtotal = 0;
    orcamento.itens.forEach(item => { subtotal += (item.qtd * item.vlr) * (1 - item.descPerc / 100); });

    const descontoGeralInput = document.getElementById('desconto-geral');
    const subtotalDisplay = document.getElementById('subtotal');
    const totalGeralDisplay = document.getElementById('total-geral');
    const printSubtotal = document.getElementById('print-subtotal');
    const printDesconto = document.getElementById('print-desconto');
    const printFreteTipo = document.getElementById('print-frete-tipo');
    const printFreteValor = document.getElementById('print-frete-valor');
    const printTotalGeral = document.getElementById('print-total-geral');


    const descontoGeral = parseFloat(descontoGeralInput?.value) || 0;
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
    empresaSelect.innerHTML = ''; // Limpa opções antigas
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
    kitSelect.innerHTML = ''; // Limpa opções antigas
    for (const key in kitsDB) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = kitsDB[key].name;
        kitSelect.appendChild(option);
    }
}

// --- Funções de Estado do Formulário do Modal ---

export function gerenciarEstadoFormularioItem(productName) {
    // Garante que os elementos do formulário existem
    if (!itemAltInput || !itemCompInput || !incluirRoloCheck || !itemQtdInput || !itemUnidInput || !itemVlrInput) return;

    const upperName = (productName || '').toUpperCase();
    const isCalcM2 = calcM2Slats.some(slat => upperName.includes(slat));
    const needsComp = needsCompItems.some(item => upperName.includes(item));
    const needsAlt = needsAltItems.some(item => upperName.includes(item));

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

    itemAltInput.disabled = altDisabled;
    itemCompInput.disabled = compDisabled;
    incluirRoloCheck.disabled = roloDisabled;
    itemQtdInput.disabled = qtdDisabled;
    itemUnidInput.disabled = unidDisabled;
    itemUnidInput.value = unidValue;
    itemQtdInput.value = qtdValue;

    if (altDisabled) itemAltInput.value = '';
    if (compDisabled) itemCompInput.value = '';
    if (roloDisabled) incluirRoloCheck.checked = false;
}

// *** ESTA É A FUNÇÃO QUE ESTAVA FALTANDO NO SEU ARQUIVO ***
export function calcularEAtualizarCamposPorta() {
    // Garante que os elementos do formulário existem
    if (!itemDescInput || !itemAltInput || !itemCompInput || !itemQtdInput || !itemUnidInput || !incluirRoloCheck) return;

    const descricao = itemDescInput.value;
    const upperName = descricao.toUpperCase();
    const isCalcM2 = calcM2Slats.some(slat => upperName.includes(slat));
    if (!isCalcM2) return;

    let alturaM = parseFloat(itemAltInput.value);
    let comprimentoM = parseFloat(itemCompInput.value);
    if (isNaN(alturaM) || alturaM <= 0 || isNaN(comprimentoM) || comprimentoM <= 0) {
        itemQtdInput.value = ''; return;
    }
    let alturaFinal = alturaM;
    if (incluirRoloCheck.checked) { alturaFinal += 0.60; }
    const areaTotalM2 = alturaFinal * comprimentoM;
    itemQtdInput.value = areaTotalM2.toFixed(2);
    itemUnidInput.value = 'm²';
}

// --- Função de Autocomplete ---
export function populateAutocompleteList(inputElement, listElement, filterFn) {
    if (!inputElement || !listElement) return;

    const query = inputElement.value.toLowerCase();
    let sourceProducts = getProdutosDB(); // Usa o getter

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
            li.addEventListener('click', async () => {
                inputElement.value = p;
                listElement.classList.add('hidden');

                if (inputElement.id === 'item-desc') { // Modal
                    const produtoInfo = await buscarPrecoProduto(p);
                    if (produtoInfo && !produtoInfo.erro) {
                        itemVlrInput.value = produtoInfo.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                        itemUnidInput.value = produtoInfo.unidade || 'un';
                    } else {
                        itemVlrInput.value = '0,00';
                        itemUnidInput.value = 'un';
                    }
                    gerenciarEstadoFormularioItem(p);
                    if (!itemAltInput.disabled) itemAltInput.focus();
                    else if (!itemCompInput.disabled) itemCompInput.focus();
                    else if (!itemQtdInput.disabled) itemQtdInput.focus();

                } else if (inputElement.classList.contains('inline-desc')) { // Inline
                    const index = inputElement.dataset.index;
                    if (orcamento.itens[index] === undefined) return; 

                    const produtoInfo = await buscarPrecoProduto(p);
                    orcamento.itens[index].descricao = p;
                    if (produtoInfo && !produtoInfo.erro) {
                        orcamento.itens[index].vlr = produtoInfo.preco;
                        orcamento.itens[index].unid = produtoInfo.unidade || 'un';
                    } else {
                        orcamento.itens[index].vlr = 0;
                        orcamento.itens[index].unid = 'un';
                    }
                    orcamento.itens[index].alt = 0;
                    orcamento.itens[index].comp = 0;
                    orcamento.itens[index].qtd = 1;

                    renderTable();

                    const upperName = p.toUpperCase();
                    let fieldToFocus = 'qtd';
                    if (calcM2Slats.some(slat => upperName.includes(slat))) fieldToFocus = 'comp';
                    else if (needsCompItems.some(item => upperName.includes(item))) fieldToFocus = 'comp';
                    else if (needsAltItems.some(item => upperName.includes(item))) fieldToFocus = 'alt';

                    const nextInput = tableBody?.querySelector(`[data-index="${index}"][data-field="${fieldToFocus}"]`);
                    if (nextInput) nextInput.focus();
                }
            });
            listElement.appendChild(li);
        });
    } else {
        listElement.classList.add('hidden');
    }
}