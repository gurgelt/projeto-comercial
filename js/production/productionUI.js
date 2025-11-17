// js/production/productionUI.js
import {
    calcM2Slats,
    needsCompItems,
    needsAltItems,
} from '../config/constants.js'; // Importa regras
import {
    producaoTableBody,
    prodPedidoNumEl,
    prodClienteNomeEl,
    prodClienteContatoEl,
    prodDataPedidoEl,
    prodVendedorNomeEl
} from '../ui/domElements.js'; // Importa seletores

// ### VERIFIQUE SE O 'EXPORT' ESTÁ AQUI ###
export function renderProductionView(orcamentoData) {
    console.log("Renderizando view de produção com dados:", orcamentoData);

    // 1. Preencher Cabeçalho (AGORA LENDO DO OBJETO 'orcamentoData')
    if (prodPedidoNumEl) prodPedidoNumEl.textContent = orcamentoData.numero || 'N/A';
    if (prodClienteNomeEl) prodClienteNomeEl.textContent = orcamentoData.cliente.nome || 'N/A';
    if (prodClienteContatoEl) prodClienteContatoEl.textContent = orcamentoData.cliente.contato || 'N/A';
    if (prodDataPedidoEl) prodDataPedidoEl.textContent = orcamentoData.data || 'N/A';
    if (prodVendedorNomeEl) prodVendedorNomeEl.textContent = "Vendedor Padrão"; // Placeholder

    // 2. Limpar e Preencher Tabela de Produção
    if (!producaoTableBody) {
        console.error("Elemento 'producao-table-body' não encontrado!");
        return;
    }
    producaoTableBody.innerHTML = '';
    let itemCounter = 1;

    // (O restante da sua lógica de renderização da tabela)
    orcamentoData.itens.forEach(item => {
        const upperName = (item.descricao || '').toUpperCase();
        
        const isLamina = calcM2Slats.some(slat => upperName.includes(slat));
        const isNeedsComp = needsCompItems.some(i => upperName.includes(i));
        const isNeedsAlt = needsAltItems.some(i => upperName.includes(i));

        const row = document.createElement('tr');

        let dimComp = item.comp > 0 ? item.comp : '-';
        let dimAlt = item.alt > 0 ? item.alt : '-';
        let prodUn = '-';
        let numLaminas = '-';
        let solComp = '-';
        let tipoFechada = '-';
        let tipoTransv = '-';

        if (isLamina) {
            const alturaLaminaCM = upperName.includes('SUPER CANA') ? 10 : 7.5;
            numLaminas = Math.ceil((parseFloat(item.alt) * 100) / alturaLaminaCM);
            solComp = item.comp;
            tipoFechada = upperName.includes('FECHADA') ? 'Sim' : '-';
            tipoTransv = upperName.includes('TRANSVISION') || upperName.includes('FURADA') ? 'Sim' : '-';
        } else if (isNeedsComp) {
            prodUn = item.qtd;
            solComp = item.comp;
        } else if (isNeedsAlt) {
            prodUn = item.qtd;
        } else {
            prodUn = item.qtd;
            dimComp = '-';
            dimAlt = '-';
        }

        row.innerHTML = `
            <td>${String(itemCounter++).padStart(3, '0')}</td>
            <td style="text-align: left; padding-left: 5px;">${item.descricao}</td> <td>${dimComp}</td>
            <td>${dimAlt}</td>
            <td>${prodUn}</td>
            <td>${numLaminas}</td>
            <td>${solComp}</td>
            <td>${tipoFechada}</td>
            <td>${tipoTransv}</td>
        `;
        producaoTableBody.appendChild(row);
    });

    // Adiciona linhas vazias
    while (itemCounter <= 12) {
        producaoTableBody.innerHTML += `
            <tr class="empty-row">
                <td>${String(itemCounter++).padStart(3, '0')}</td>
                <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
            </tr>`;
    }
}