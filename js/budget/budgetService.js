// js/budget/budgetService.js
import { lastCalculatedDimensions } from '../state.js';
import { calcM2Slats, needsCompItems, needsAltItems, kitsDB } from '../config/constants.js';
import { buscarPrecoProduto } from '../api.js';
import { parseCurrency } from '../utils.js';
import { addItemToBudget } from '../store.js';

export async function handleAddItemSubmit(data) {
    let newItem;
    let itemsAddedNames = [];
    const { 
        descricao, alt, comp, vlr, unid, descPerc, 
        isCalcM2, needsComp, needsAlt, incluirRolo, selectedKitKey 
    } = data;

    // (O 'qtd' foi removido dos parâmetros, pois vamos recalcular aqui)

    if (isCalcM2) {
        let alturaM = alt;
        const comprimentoM = comp;
        if (isNaN(alturaM) || alturaM <= 0 || isNaN(comprimentoM) || comprimentoM <= 0) {
            throw new Error('Para calcular, preencha a Altura e o Comprimento.');
        }
        
        const alturaProducao = incluirRolo ? alturaM + 0.60 : alturaM;
        
        const areaTotalM2 = alturaProducao * comprimentoM;
        
        lastCalculatedDimensions.altura = alturaM;
        lastCalculatedDimensions.comprimento = comprimentoM;

        newItem = { 
            descricao, 
            comp: comprimentoM.toFixed(2), 
            alt: alturaProducao.toFixed(2), 
            qtd: parseFloat(areaTotalM2.toFixed(2)), 
            unid: 'm²', 
            vlr: vlr, 
            descPerc: 0 
        };
    
    } else if (needsComp) {
        const comprimentoM = comp;
        if (isNaN(comprimentoM) || comprimentoM <= 0) { 
            throw new Error('Preencha o Comprimento.'); 
        }
        newItem = { descricao, comp: comprimentoM.toFixed(2), alt: 0, qtd: data.qtd || 1, unid: 'm', vlr: vlr || 0, descPerc: descPerc || 0 };
    
    } else if (needsAlt) {
        const alturaM = alt;
        if (isNaN(alturaM) || alturaM <= 0) { 
            throw new Error('Preencha a Altura.'); 
        }
        newItem = { descricao, comp: 0, alt: alturaM.toFixed(2), qtd: data.qtd || 1, unid: 'm', vlr: vlr || 0, descPerc: descPerc || 0 };
    
    } else {
        newItem = { descricao, comp: 0, alt: 0, qtd: data.qtd || 1, unid: unid, vlr: vlr || 0, descPerc: descPerc || 0 };
    }

    addItemToBudget(newItem);
    itemsAddedNames.push(newItem.descricao);

    // Lógica de "Kit"
    if (isCalcM2 && selectedKitKey !== 'todos' && kitsDB[selectedKitKey]?.items.length > 0) {
        const kit = kitsDB[selectedKitKey];
        
        for (const itemName of kit.items) {
            if (newItem.descricao.toUpperCase().includes(itemName.toUpperCase())) continue;

            const produtoInfo = await buscarPrecoProduto(itemName);
            const preco = produtoInfo ? produtoInfo.preco : 0;
            const unidadeDB = produtoInfo ? (produtoInfo.unidade || 'un') : 'un';
            
            const upperItemName = itemName.toUpperCase();
            let compKit = 0;
            let altKit = 0;
            let qtdKit = 1;
            let unidKit = unidadeDB;

            // ######################################################
            // ### INÍCIO DA CORREÇÃO DE LÓGICA DO KIT ###
            // ######################################################
            // Trocamos a lógica frágil de "correspondência exata" (needsCompItems.includes(upperItemName))
            // pela lógica robusta de "verificar se CONTÉM" (some(keyword => ...)),
            // alinhando-se com o resto da aplicação (ex: budgetUI.js).

            // O nome do item (em maiúsculo) CONTÉM alguma palavra-chave de needsCompItems?
            if (needsCompItems.some(keyword => upperItemName.includes(keyword))) {
                compKit = lastCalculatedDimensions.comprimento.toFixed(2);
                unidKit = 'm';
            } 
            // O nome do item (em maiúsculo) CONTÉM alguma palavra-chave de needsAltItems?
            else if (needsAltItems.some(keyword => upperItemName.includes(keyword))) {
                altKit = lastCalculatedDimensions.altura.toFixed(2);
                unidKit = 'm';
            }
            // ######################################################
            // ### FIM DA CORREÇÃO DE LÓGICA DO KIT ###
            // ######################################################
            
            const companionItem = {
                descricao: itemName, 
                comp: compKit, 
                alt: altKit, 
                qtd: qtdKit, 
                unid: unidKit, 
                vlr: preco, 
                descPerc: 0
            };
            addItemToBudget(companionItem);
            itemsAddedNames.push(companionItem.descricao);
        }
    }
    return itemsAddedNames;
}