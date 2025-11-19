// js/budget/budgetEvents.js
import { showProductionView } from '../navigation.js';
import { lastCalculatedDimensions, getProdutosDB } from '../state.js';
import { calcM2Slats, needsCompItems, needsAltItems, kitsDB } from '../config/constants.js';
import {
    clienteInputs, itemForm, editOrcamentoForm, tableBody,
    clienteForm as clienteFormRef, startScreen, mainContent, orcamentoModal, editOrcamentoModal,
    itemDescInput, autocompleteList, itemAltInput, itemCompInput,
    incluirRoloCheck, voltarBtn, itemQtdInput, itemUnidInput,
    itemVlrInput, kitSelect, btnAddInlineRow, btnAddItemModal,
    freteTipoSelect, freteValorRow, freteValorInput, empresaSelect,
    clientTypeModal, orcamentoNumDisplay, orcamentoDataDisplay,
    descontoGeralInput, editOrcamentoNumInput, editOrcamentoDataInput,
    modalStep1, modalStep2, itemDescPercInput
} from '../ui/domElements.js';
import { formatarCPFCNPJ, hideAllAutocompletes, parseCurrency } from '../utils.js';
import {
    renderInfo, renderTable, addNewRow, updateTableRow,
    gerenciarEstadoFormularioItem, calcularEAtualizarCamposPorta,
    recalcularTudo, populateAutocompleteList, atualizarDadosEmpresa
} from './budgetUI.js';
import { buscarPrecoProduto } from '../api.js';
import { handleAddItemSubmit } from './budgetService.js';
import {
    getOrcamento, setTipoCliente, setClientInfo, addItemToBudget,
    removeItemFromBudget, setOrcamentoInfo, updateItemCompleto
} from '../store.js';

// --- Funções Auxiliares ---

function updateModalAutocomplete() {
    if (!itemDescInput || !autocompleteList || !kitSelect) return;
    populateAutocompleteList(itemDescInput, autocompleteList, (source) => {
        const selectedKitKey = kitSelect.value;
        const upperQuery = itemDescInput.value.toUpperCase();
        const filteredByQuery = source.filter(p => p.toUpperCase().includes(upperQuery));
        
        if (selectedKitKey !== 'todos') {
            return filteredByQuery.filter(p => 
                calcM2Slats.some(slat => p.toUpperCase().includes(slat))
            );
        }
        return filteredByQuery;
    });
}

async function handleModalAutocompleteClick(productName) {
    itemDescInput.value = productName;
    autocompleteList.classList.add('hidden');
    const produtoInfo = await buscarPrecoProduto(productName);
    if (produtoInfo && !produtoInfo.erro) {
        itemVlrInput.value = produtoInfo.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        itemUnidInput.value = produtoInfo.unidade || 'un';
    } else {
        itemVlrInput.value = '0,00';
        itemUnidInput.value = 'un';
    }
    gerenciarEstadoFormularioItem(productName);
    if (!itemAltInput.disabled) itemAltInput.focus();
    else if (!itemCompInput.disabled) itemCompInput.focus();
    else if (!itemQtdInput.disabled) itemQtdInput.focus();
}

async function handleInlineAutocompleteClick(productName, targetInput) {
    // Garante que o índice seja um número
    const index = parseInt(targetInput.dataset.index); 
    const item = getOrcamento().itens[index];
    if (item === undefined) return;
    
    const produtoInfo = await buscarPrecoProduto(productName);
    item.descricao = productName;
    if (produtoInfo && !produtoInfo.erro) {
        item.vlr = produtoInfo.preco;
        item.unid = produtoInfo.unidade || 'un';
    } else {
        item.vlr = 0;
        item.unid = 'un';
    }
    // Reseta valores padrão ao mudar o item
    item.alt = 0;
    item.comp = 0;
    item.qtd = 1;

    const upperName = productName.toUpperCase();
    let fieldToFocus = 'qtd'; 
    
    if (calcM2Slats.some(slat => upperName.includes(slat))) {
        fieldToFocus = 'comp';
    } else if (needsCompItems.some(item => upperName.includes(item))) {
        fieldToFocus = 'comp';
    } else if (needsAltItems.some(item => upperName.includes(item))) {
        fieldToFocus = 'alt';
    }

    updateItemCompleto(index, item, { focusField: fieldToFocus });
}


// --- Setup dos Listeners ---

export function setupBudgetEventListeners() {

    // --- Ouvinte Global de Estado ---
    document.addEventListener('stateChanged', (e) => {
        const { action, payload } = e.detail;
        switch (action) {
            case 'itemAdded':
                addNewRow(payload.item, payload.index);
                if (payload.options?.focusAndSelect) {
                    setTimeout(() => {
                        const lastRowInput = tableBody.querySelector('tr:last-child .inline-desc');
                        if (lastRowInput) {
                            lastRowInput.focus();
                            lastRowInput.select();
                            const list = lastRowInput.nextElementSibling;
                            if (list) {
                                populateAutocompleteList(lastRowInput, list, () => getProdutosDB());
                            }
                        }
                    }, 0);
                }
                break;
            case 'itemUpdated':
                updateTableRow(payload.item, payload.index, payload.options); 
                break;
            case 'clientInfoUpdated':
                renderInfo(payload.cliente);
                break;
            case 'recalculateTotals':
                recalcularTudo(payload.itens);
                break;
            case 'fullRender':
                renderTable(payload.itens);
                renderInfo(payload.cliente);
                break;
        }
    });

    // --- Eventos Iniciais ---
    const initBtn = document.getElementById('init-orcamento-btn'); 
    if (initBtn) {
        initBtn.addEventListener('click', () => {
            clientTypeModal.classList.add('active');
        });
    }
    if (empresaSelect) {
        empresaSelect.addEventListener('change', atualizarDadosEmpresa);
    }
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.remove('active');
        });
    });
    const handleTipoClienteSelect = (e) => {
        const tipo = e.target.dataset.tipo;
        setTipoCliente(tipo);
        const numeroOrcamento = Math.floor(10000 + Math.random() * 90000);
        const dataOrcamento = new Date().toLocaleDateString('pt-BR');
        setOrcamentoInfo(numeroOrcamento, dataOrcamento); 
        if (orcamentoNumDisplay) orcamentoNumDisplay.textContent = numeroOrcamento;
        if (orcamentoDataDisplay) orcamentoDataDisplay.textContent = dataOrcamento;
        clientTypeModal.classList.remove('active');
        startScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');
    };
    document.getElementById('tipo-serralheiro-btn').addEventListener('click', handleTipoClienteSelect);
    document.getElementById('tipo-cliente-final-btn').addEventListener('click', handleTipoClienteSelect);

    // --- Eventos de Formulários (Modais) ---
    if (clienteFormRef) {
        clienteFormRef.addEventListener('submit', (e) => {
            e.preventDefault();
            let clienteData = {};
            for (const key in clienteInputs) {
                if (clienteInputs[key]) { 
                    clienteData[key] = clienteInputs[key].value;
                }
            }
            setClientInfo(clienteData);
            orcamentoModal.classList.remove('active');
        });
    }

    if (itemForm) {
        itemForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const descricao = itemDescInput.value;
            if (!descricao) {
                 alert('Selecione uma descrição para o item.');
                 return;
            }
            const upperName = (descricao || '').toUpperCase();
            const isCalcM2 = calcM2Slats.some(slat => upperName.includes(slat));
            
            const formData = {
                descricao: descricao,
                alt: parseCurrency(itemAltInput.value),
                comp: parseCurrency(itemCompInput.value),
                qtd: parseCurrency(itemQtdInput.value),
                vlr: parseCurrency(itemVlrInput.value),
                unid: itemUnidInput.value,
                descPerc: parseCurrency(itemDescPercInput.value),
                incluirRolo: incluirRoloCheck.checked,
                selectedKitKey: kitSelect.value,
                isCalcM2: isCalcM2,
                needsComp: needsCompItems.some(item => upperName.includes(item)),
                needsAlt: needsAltItems.some(item => upperName.includes(item))
            };
            try {
                const itemsAddedNames = await handleAddItemSubmit(formData);
                alert(`${itemsAddedNames.length} item(ns) adicionados:\n- ${itemsAddedNames.join('\n- ')}`);
                itemForm.reset();
                gerenciarEstadoFormularioItem("");
                updateModalAutocomplete();
                itemDescInput.focus();
            } catch (error) {
                console.error("Falha ao adicionar item:", error);
                alert(error.message);
            }
        });
    }

    if (editOrcamentoForm) {
        editOrcamentoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const numero = editOrcamentoNumInput.value;
            const data = editOrcamentoDataInput.value;
            setOrcamentoInfo(numero, data);
            orcamentoNumDisplay.textContent = numero;
            orcamentoDataDisplay.textContent = data;
            editOrcamentoModal.classList.remove('active');
        });
    }

    // --- Botões de Edição ---
    document.getElementById('edit-cliente-btn').addEventListener('click', () => {
        const state = getOrcamento();
        for (const key in clienteInputs) {
            if (clienteInputs[key]) { clienteInputs[key].value = state.cliente[key] || ''; }
        }
        formatarCPFCNPJ(clienteInputs.cnpj);
        orcamentoModal.classList.add('active');
        modalStep1.classList.remove('hidden');
        modalStep2.classList.add('hidden');
    });

    document.getElementById('edit-orcamento-btn').addEventListener('click', () => {
        editOrcamentoNumInput.value = orcamentoNumDisplay.textContent;
        editOrcamentoDataInput.value = orcamentoDataDisplay.textContent;
        editOrcamentoModal.classList.add('active');
    });

    if (btnAddItemModal) {
        btnAddItemModal.addEventListener('click', () => {
            orcamentoModal.classList.add('active');
            modalStep1.classList.add('hidden');
            modalStep2.classList.remove('hidden');
            itemForm.reset();
            kitSelect.value = 'todos';
            incluirRoloCheck.checked = false;
            gerenciarEstadoFormularioItem("");
            updateModalAutocomplete();
            itemDescInput.focus();
        });
    }

    if (voltarBtn) {
        voltarBtn.addEventListener('click', () => {
            modalStep2.classList.add('hidden');
            modalStep1.classList.remove('hidden');
        });
    }

    if (itemAltInput) itemAltInput.addEventListener('input', calcularEAtualizarCamposPorta);
    if (itemCompInput) itemCompInput.addEventListener('input', calcularEAtualizarCamposPorta);
    if (incluirRoloCheck) incluirRoloCheck.addEventListener('change', calcularEAtualizarCamposPorta);
    if (clienteInputs.cnpj) clienteInputs.cnpj.addEventListener('input', (e) => formatarCPFCNPJ(e.target));

    if (descontoGeralInput) descontoGeralInput.addEventListener('input', () => recalcularTudo());
    if (freteTipoSelect) {
        freteTipoSelect.addEventListener('change', () => {
            freteValorRow.classList.toggle('hidden', freteTipoSelect.value !== 'Correio');
            if (freteTipoSelect.value !== 'Correio') freteValorInput.value = '0,00';
            recalcularTudo();
        });
    }
    if (freteValorInput) freteValorInput.addEventListener('input', () => recalcularTudo());

    // --- Eventos da Tabela (Edição Inline) ---

    if (btnAddInlineRow) {
        btnAddInlineRow.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            addItemToBudget(
                { descricao: 'NOVO ITEM - Clique para editar', comp: 0, alt: 0, qtd: 1, unid: 'un', vlr: 0, descPerc: 0 },
                { focusAndSelect: true }
            );
        });
    }


    if (tableBody) {
        // --- Listener para MUDANÇAS (inputs) ---
        tableBody.addEventListener('change', (e) => {
            const target = e.target;
            if (target.classList.contains('inline-input') || target.classList.contains('inline-desc')) {
                const index = parseInt(target.dataset.index);
                const state = getOrcamento();
                if (!state.itens[index]) return;

                const field = target.dataset.field || 'descricao';
                let value = target.value;

                if (field === 'vlr' || field === 'comp' || field === 'alt' || field === 'qtd' || field === 'descPerc') {
                    value = parseCurrency(value) || 0;
                }
                
                const item = state.itens[index];
                item[field] = value;
                
                const upperName = (item.descricao || '').toUpperCase();
                const isCalcM2 = calcM2Slats.some(slat => upperName.includes(slat));

                if (isCalcM2 && (field === 'comp' || field === 'alt')) {
                    const areaTotalM2 = (item.comp || 0) * (item.alt || 0);
                    item.qtd = parseFloat(areaTotalM2.toFixed(2));
                    item.unid = 'm²';
                }
                
                updateItemCompleto(index, item, { focusField: field });
            }
        });

        // --- Listener para FILTRAR enquanto digita ---
        tableBody.addEventListener('input', (e) => {
            const input = e.target;
            if (input.classList.contains('inline-desc')) {
                const list = input.nextElementSibling;
                if (!list) return;
                populateAutocompleteList(input, list, (source) => source.filter(p => p.toUpperCase().includes(input.value.toUpperCase())));
            }
        });

        // ######################################################
        // ### CORREÇÃO DEFINITIVA: CLIQUE FANTASMA ###
        // ######################################################
        // Usamos 'mousedown' em vez de 'click' para o Autocomplete.
        // 'mousedown' dispara ANTES do 'blur', permitindo capturar a seleção.
        tableBody.addEventListener('mousedown', (e) => {
            const li = e.target.closest('.autocomplete-list li');
            if (li && li.dataset.productName) {
                // PREVINE o blur do input! Isso é a chave.
                // Impede que o evento 'change' (com o texto incompleto) dispare.
                e.preventDefault(); 
                e.stopPropagation();
                
                const productName = li.dataset.productName;
                const wrapper = e.target.closest('.inline-autocomplete-wrapper');
                const input = wrapper?.querySelector('.inline-desc');
                
                if (input) {
                    handleInlineAutocompleteClick(productName, input);
                }
            }
        });
        // ######################################################

        // Listener para CLIQUES GERAIS (Remover Item e Abrir Lista)
        tableBody.addEventListener('click', (e) => {
            // Delegação para o Botão Remover
            if (e.target.closest('.remove-item')) {
                e.stopPropagation(); 
                const index = parseInt(e.target.closest('tr').dataset.index);
                removeItemFromBudget(index);
                return;
            }

            // Delegação para ABRIR o autocomplete ao clicar no INPUT
            const input = e.target;
            if (input.classList.contains('inline-desc')) {
                e.stopPropagation(); 
                const list = input.nextElementSibling;
                if (!list) return;
                
                // Abre a lista já filtrada com o que tiver no input
                populateAutocompleteList(input, list, (source) => {
                    const query = input.value.toUpperCase();
                    return source.filter(p => p.toUpperCase().includes(query));
                });
            }
        });
        
        // Listener para NAVEGAÇÃO (setas)
        tableBody.addEventListener('keydown', (e) => {
            const target = e.target;
            if (!target.classList.contains('inline-input') && !target.classList.contains('inline-desc')) return;
            const key = e.key;
            if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return; 
            e.preventDefault(); 
            const currentCell = target.closest('td');
            const currentRow = currentCell.closest('tr');
            const cellIndex = currentCell.cellIndex;
            const rowIndex = currentRow.rowIndex - 1; 
            let nextElement = null;
            try {
                if (key === 'ArrowUp' && rowIndex > 0) {
                    nextElement = tableBody.rows[rowIndex - 1].cells[cellIndex]?.querySelector('.inline-input, .inline-desc');
                } else if (key === 'ArrowDown' && rowIndex < tableBody.rows.length - 1) {
                    nextElement = tableBody.rows[rowIndex + 1].cells[cellIndex]?.querySelector('.inline-input, .inline-desc');
                } else if (key === 'ArrowLeft' && cellIndex > 1) {
                    nextElement = currentRow.cells[cellIndex - 1]?.querySelector('.inline-input, .inline-desc');
                } else if (key === 'ArrowRight' && cellIndex < currentRow.cells.length - 3) {
                    nextElement = currentRow.cells[cellIndex + 1]?.querySelector('.inline-input, .inline-desc');
                }
            } catch (err) {
                console.warn("Erro na navegação por setas:", err);
                return;
            }
            if (nextElement && !nextElement.disabled) {
                nextElement.focus();
                nextElement.select(); 
            } else if (nextElement && nextElement.disabled) {
                 const nextEvent = new KeyboardEvent('keydown', { key: key, bubbles: true, cancelable: true });
                 nextElement.dispatchEvent(nextEvent);
            }
        });
    }

    // --- Listeners Diversos ---
    if (autocompleteList) {
        // Autocomplete do Modal (mantém click pois não tem edição inline concorrente)
        autocompleteList.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (li && li.dataset.productName) {
                handleModalAutocompleteClick(li.dataset.productName);
            }
        });
    }
    if (itemDescInput) {
        itemDescInput.addEventListener('focus', () => updateModalAutocomplete());
        itemDescInput.addEventListener('input', () => updateModalAutocomplete());
    }
    if (kitSelect) {
        kitSelect.addEventListener('change', () => {
            itemDescInput.value = '';
            gerenciarEstadoFormularioItem("");
            updateModalAutocomplete();
            itemDescInput.focus();
        });
    }

    // Fecha autocompletes ao clicar fora
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.inline-autocomplete-wrapper') && e.target.id !== 'item-desc' && !e.target.closest('.autocomplete-list')) {
            hideAllAutocompletes();
        }
    });

     let gerarPedidoBtn = document.getElementById('gerar-pedido-btn');
     if (!gerarPedidoBtn) {
         gerarPedidoBtn = document.createElement('button');
         gerarPedidoBtn.id = 'gerar-pedido-btn';
         gerarPedidoBtn.className = 'btn btn-secondary no-print';
         gerarPedidoBtn.innerHTML = `
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
             Gerar Pedido Produção
         `;
         const orcamentoActions = document.getElementById('orcamento-actions');
         if (orcamentoActions) {
            orcamentoActions.insertBefore(gerarPedidoBtn, orcamentoActions.firstChild); 
         }
     }
     gerarPedidoBtn.addEventListener('click', showProductionView); 
}