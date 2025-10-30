// js/budget/budgetEvents.js
import {
    orcamento, clienteInputs, itemForm, editOrcamentoForm, tableBody,
    clienteForm as clienteFormRef,
    startScreen, mainContent, orcamentoModal, editOrcamentoModal,
    itemDescInput, autocompleteList, itemAltInput, itemCompInput,
    incluirRoloCheck, voltarBtn, itemQtdInput, itemUnidInput,
    itemVlrInput, kitSelect, btnAddInlineRow, btnAddItemModal,
    freteTipoSelect, freteValorRow, freteValorInput, getProdutosDB, calcM2Slats,
    needsCompItems, needsAltItems, kitsDB, lastCalculatedDimensions // Importa o objeto
} from '../state.js';
import { formatarCPFCNPJ, hideAllAutocompletes, parseCurrency } from '../utils.js';
import { buscarPrecoProduto } from '../api.js';
import {
    renderInfo, renderTable, gerenciarEstadoFormularioItem,
    calcularEAtualizarCamposPorta, recalcularTudo,
    populateAutocompleteList
} from './budgetUI.js';
import { showProductionView } from '../navigation.js';

export function setupBudgetEventListeners() {

    // --- Eventos Iniciais e de Navegação Básica ---
    document.getElementById('init-orcamento-btn').addEventListener('click', () => {
        document.getElementById('client-type-modal').classList.add('active');
    });

    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.target.closest('.modal-overlay').classList.remove('active');
        });
    });

    const handleTipoClienteSelect = (e) => {
        orcamento.tipoCliente = e.target.dataset.tipo;
        document.getElementById('orcamento-num-display').textContent = Math.floor(10000 + Math.random() * 90000);
        document.getElementById('client-type-modal').classList.remove('active');
        startScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');
        renderTable(); // Renderiza a tabela vazia
    };
    document.getElementById('tipo-serralheiro-btn').addEventListener('click', handleTipoClienteSelect);
    document.getElementById('tipo-cliente-final-btn').addEventListener('click', handleTipoClienteSelect);

    // --- Eventos dos Formulários ---
    clienteFormRef.addEventListener('submit', (e) => {
        e.preventDefault();
        for (const key in clienteInputs) {
            if (clienteInputs[key]) { orcamento.cliente[key] = clienteInputs[key].value; }
        }
        renderInfo();
        orcamentoModal.classList.remove('active');
    });

    // --- Listener de Submit do ItemForm ---
    itemForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let newItem;
        const descricao = itemDescInput.value;
        let itemsAddedNames = [];

        const upperName = (descricao || '').toUpperCase();
        const isCalcM2 = calcM2Slats.some(slat => upperName.includes(slat));
        const needsComp = needsCompItems.some(item => upperName.includes(item));
        const needsAlt = needsAltItems.some(item => upperName.includes(item));
        
        if (!descricao) {
             alert('Selecione uma descrição para o item.');
             return;
        }

        if (isCalcM2) {
            let alturaM = parseFloat(itemAltInput.value);
            const comprimentoM = parseFloat(itemCompInput.value);
            if (isNaN(alturaM) || alturaM <= 0 || isNaN(comprimentoM) || comprimentoM <= 0) { alert('Para calcular, preencha a Altura e o Comprimento.'); return; }
            const areaTotalM2 = parseFloat(itemQtdInput.value);
            const precoPorM2 = parseCurrency(itemVlrInput.value);
            const comprimentoProducao = comprimentoM;
            const alturaProducao = incluirRoloCheck.checked ? alturaM + 0.60 : alturaM;
            
            // --- CORREÇÃO AQUI ---
            // Não reatribua a variável, modifique suas propriedades
            lastCalculatedDimensions.altura = alturaM;
            lastCalculatedDimensions.comprimento = comprimentoM; 
            // --- FIM DA CORREÇÃO ---

            newItem = { descricao, comp: comprimentoProducao.toFixed(2), alt: alturaProducao.toFixed(2), qtd: areaTotalM2, unid: 'm²', vlr: precoPorM2, descPerc: 0 };
        } else if (needsComp) {
            const comprimentoM = parseFloat(itemCompInput.value);
            if (isNaN(comprimentoM) || comprimentoM <= 0) { alert('Preencha o Comprimento.'); return; }
            newItem = { descricao, comp: comprimentoM.toFixed(2), alt: 0, qtd: parseFloat(itemQtdInput.value) || 1, unid: 'm', vlr: parseCurrency(itemVlrInput.value) || 0, descPerc: parseFloat(document.getElementById('item-desc-perc').value) || 0 };
        } else if (needsAlt) {
            const alturaM = parseFloat(itemAltInput.value);
            if (isNaN(alturaM) || alturaM <= 0) { alert('Preencha a Altura.'); return; }
            newItem = { descricao, comp: 0, alt: alturaM.toFixed(2), qtd: parseFloat(itemQtdInput.value) || 1, unid: 'm', vlr: parseCurrency(itemVlrInput.value) || 0, descPerc: parseFloat(document.getElementById('item-desc-perc').value) || 0 };
        } else {
            newItem = { descricao, comp: 0, alt: 0, qtd: parseFloat(itemQtdInput.value) || 1, unid: itemUnidInput.value, vlr: parseCurrency(itemVlrInput.value) || 0, descPerc: parseFloat(document.getElementById('item-desc-perc').value) || 0 };
        }

        orcamento.itens.push(newItem);
        itemsAddedNames.push(newItem.descricao);

        // --- Lógica de Auto-preenchimento do Kit ---
        const selectedKitKey = kitSelect.value;
        if (isCalcM2 && selectedKitKey !== 'todos' && kitsDB[selectedKitKey].items.length > 0) {
            
            const kit = kitsDB[selectedKitKey];
            
            for (const itemName of kit.items) {
                if (newItem.descricao.toUpperCase().includes(itemName.toUpperCase())) continue; 

                const produtoInfo = await buscarPrecoProduto(itemName);
                const preco = produtoInfo ? produtoInfo.preco : 0;
                const unidadeDB = produtoInfo ? (produtoInfo.unidade || 'un') : 'un';
                
                const upperItemName = itemName.toUpperCase();
                let comp = 0;
                let alt = 0;
                let qtd = 1; 
                let unid = unidadeDB; 

                if (needsCompItems.some(i => upperItemName.includes(i))) {
                    comp = lastCalculatedDimensions.comprimento.toFixed(2); 
                    unid = 'm'; 
                } 
                else if (needsAltItems.some(i => upperItemName.includes(i))) {
                    alt = lastCalculatedDimensions.altura.toFixed(2); 
                    unid = 'm'; 
                }
                
                const companionItem = {
                    descricao: itemName, 
                    comp: comp, 
                    alt: alt, 
                    qtd: qtd, 
                    unid: unid, 
                    vlr: preco, 
                    descPerc: 0
                };
                orcamento.itens.push(companionItem);
                itemsAddedNames.push(companionItem.descricao);
            }
        }
        // --- Fim da Lógica do Kit ---

        alert(`${itemsAddedNames.length} item(ns) adicionados:\n- ${itemsAddedNames.join('\n- ')}`);
        renderTable();
        itemForm.reset();
        gerenciarEstadoFormularioItem(""); // Reseta campos do modal
        itemDescInput.focus();
    });


    editOrcamentoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('orcamento-num-display').textContent = document.getElementById('orcamento-num-edit').value;
        document.getElementById('orcamento-data-display').textContent = document.getElementById('orcamento-data-edit').value;
        editOrcamentoModal.classList.remove('active');
    });

    // --- Eventos dos Botões ---
    document.getElementById('edit-cliente-btn').addEventListener('click', () => {
        for (const key in clienteInputs) {
            if (clienteInputs[key]) { clienteInputs[key].value = orcamento.cliente[key] || ''; }
        }
        formatarCPFCNPJ(clienteInputs.cnpj); // Formata ao abrir
        orcamentoModal.classList.add('active');
        document.getElementById('modal-step-1').classList.remove('hidden');
        document.getElementById('modal-step-2').classList.add('hidden');
    });

    document.getElementById('edit-orcamento-btn').addEventListener('click', () => {
        document.getElementById('orcamento-num-edit').value = document.getElementById('orcamento-num-display').textContent;
        document.getElementById('orcamento-data-edit').value = document.getElementById('orcamento-data-display').textContent;
        editOrcamentoModal.classList.add('active');
    });

    btnAddItemModal.addEventListener('click', () => {
        orcamentoModal.classList.add('active');
        document.getElementById('modal-step-1').classList.add('hidden');
        document.getElementById('modal-step-2').classList.remove('hidden');
        itemForm.reset();
        kitSelect.value = 'todos';
        incluirRoloCheck.checked = false;
        gerenciarEstadoFormularioItem(""); // Reseta estado dos campos
        itemDescInput.focus();
    });

    voltarBtn.addEventListener('click', () => {
        document.getElementById('modal-step-2').classList.add('hidden');
        document.getElementById('modal-step-1').classList.remove('hidden');
    });

    // --- Eventos do Formulário do Modal ---
    itemAltInput.addEventListener('input', calcularEAtualizarCamposPorta);
    itemCompInput.addEventListener('input', calcularEAtualizarCamposPorta);
    incluirRoloCheck.addEventListener('change', calcularEAtualizarCamposPorta);
    clienteInputs.cnpj.addEventListener('input', (e) => formatarCPFCNPJ(e.target));

    // --- Eventos de Totais ---
    document.getElementById('desconto-geral').addEventListener('input', recalcularTudo);
    freteTipoSelect.addEventListener('change', () => {
        freteValorRow.classList.toggle('hidden', freteTipoSelect.value !== 'Correio');
        if (freteTipoSelect.value !== 'Correio') freteValorInput.value = '0,00';
        recalcularTudo();
    });
    freteValorInput.addEventListener('input', recalcularTudo);

    // --- Eventos da Tabela (Edição Inline) ---
    btnAddInlineRow.addEventListener('click', () => {
        orcamento.itens.push({ descricao: 'NOVO ITEM - Clique para editar', comp: 0, alt: 0, qtd: 1, unid: 'un', vlr: 0, descPerc: 0 });
        renderTable();
        const lastRowInput = tableBody.querySelector('tr:last-child .inline-desc');
        if (lastRowInput) {
            lastRowInput.focus();
            lastRowInput.select();
        }
    });

    tableBody.addEventListener('change', (e) => {
        const target = e.target;
        if (target.classList.contains('inline-input') || target.classList.contains('inline-desc')) {
            const index = target.dataset.index;
            if (!orcamento.itens[index]) return;

            const field = target.dataset.field || 'descricao';
            let value = target.value;

            if (field === 'vlr') { value = parseCurrency(value); }
            else if (field !== 'descricao' && field !== 'unid') { value = parseFloat(value) || 0; }

            orcamento.itens[index][field] = value;

            const item = orcamento.itens[index];
            const upperName = (item.descricao || '').toUpperCase();
            const isCalcM2 = calcM2Slats.some(slat => upperName.includes(slat));

            let forceRender = false;

            if (isCalcM2 && (field === 'comp' || field === 'alt')) {
                const areaTotalM2 = (parseFloat(item.comp) || 0) * (parseFloat(item.alt) || 0);
                orcamento.itens[index].qtd = parseFloat(areaTotalM2.toFixed(2));
                orcamento.itens[index].unid = 'm²';
                forceRender = true;
            }

            if (field === 'qtd' || field === 'vlr' || field === 'descPerc' || forceRender) {
                const focusedDataField = document.activeElement.dataset.field;
                const focusedDataIndex = document.activeElement.dataset.index;
                renderTable();
                if (focusedDataField && focusedDataIndex) {
                    const newTarget = tableBody.querySelector(`[data-index="${focusedDataIndex}"][data-field="${focusedDataField}"]`);
                    if (newTarget) newTarget.focus();
                }
            } else {
                recalcularTudo();
            }
        }
    });

    // --- Autocomplete e Ações Inline ---
    tableBody.addEventListener('focusin', (e) => {
        const input = e.target;
        if (input.classList.contains('inline-desc')) {
            const list = input.nextElementSibling;
            if (!list) return;
            populateAutocompleteList(input, list, () => getProdutosDB()); // Filtro retorna todos
        }
    });

    tableBody.addEventListener('input', (e) => {
        const input = e.target;
        if (input.classList.contains('inline-desc')) {
            const list = input.nextElementSibling;
            if (!list) return;
            populateAutocompleteList(input, list, () => getProdutosDB());
        }
    });

    tableBody.addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) {
            const index = e.target.closest('tr').dataset.index;
            orcamento.itens.splice(index, 1);
            renderTable();
            return;
        }
        // A lógica de clique na LI agora está dentro de populateAutocompleteList (em budgetUI.js)
    });

    // --- Fim da Edição Inline ---


    // --- Autocomplete do Modal ---
    itemDescInput.addEventListener('focus', () => {
         populateAutocompleteList(itemDescInput, autocompleteList, (source) => {
            const selectedKitKey = kitSelect.value;
            if (selectedKitKey !== 'todos') {
                return source.filter(p => calcM2Slats.includes(p));
            }
            return source;
        });
    });

    itemDescInput.addEventListener('input', () => {
         populateAutocompleteList(itemDescInput, autocompleteList, (source) => {
            const selectedKitKey = kitSelect.value;
            if (selectedKitKey !== 'todos') {
                return source.filter(p => calcM2Slats.includes(p));
            }
            return source;
        });
    });

    kitSelect.addEventListener('change', () => {
        itemDescInput.value = '';
        itemDescInput.focus(); // Foca para mostrar a lista já filtrada
        gerenciarEstadoFormularioItem(""); // Reseta o estado
    });

    // --- Listener Global ---
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.inline-autocomplete-wrapper') && e.target.id !== 'item-desc' && !e.target.closest('.autocomplete-list')) {
            hideAllAutocompletes();
        }
    });

     // --- Listener para Gerar Pedido ---
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