// js/production/productionUI.js
import {
    orcamento,
    calcM2Slats,       // Importa lâminas
    needsCompItems,  // <-- ADICIONADO
    needsAltItems,     // <-- ADICIONADO
    producaoTableBody
} from '../state.js';
// Não precisamos de formatCurrency aqui por enquanto

export function renderProductionView(orcamentoData) {
    console.log("Renderizando view de produção com dados:", orcamentoData);

    // 1. Preencher Cabeçalho e Informações Gerais
    const pedidoNumEl = document.getElementById('prod-pedido-num');
    const clienteNomeEl = document.getElementById('prod-cliente-nome');
    const clienteContatoEl = document.getElementById('prod-cliente-contato');
    const dataPedidoEl = document.getElementById('prod-data-pedido');
    const vendedorNomeEl = document.getElementById('prod-vendedor-nome');

    if (pedidoNumEl) pedidoNumEl.textContent = document.getElementById('orcamento-num-display')?.textContent || 'N/A';
    if (clienteNomeEl) clienteNomeEl.textContent = orcamentoData.cliente.nome || 'N/A';
    if (clienteContatoEl) clienteContatoEl.textContent = orcamentoData.cliente.contato || 'N/A';
    if (dataPedidoEl) dataPedidoEl.textContent = document.getElementById('orcamento-data-display')?.textContent || new Date().toLocaleDateString('pt-BR');
    if (vendedorNomeEl) vendedorNomeEl.textContent = "Vendedor Padrão"; // Placeholder

    // 2. Limpar e Preencher Tabela de Produção
    if (!producaoTableBody) {
        console.error("Elemento 'producao-table-body' não encontrado!");
        return;
    }
    producaoTableBody.innerHTML = '';
    let itemCounter = 1;

    // --- LÓGICA ATUALIZADA: Iterar sobre TODOS os itens ---
    orcamentoData.itens.forEach(item => {
        const upperName = (item.descricao || '').toUpperCase();
        
        // Verifica o tipo de item
        const isLamina = calcM2Slats.some(slat => upperName.includes(slat));
        const isNeedsComp = needsCompItems.some(i => upperName.includes(i)); // Ex: Soleira, Tubo
        const isNeedsAlt = needsAltItems.some(i => upperName.includes(i)); // Ex: Guia

        const row = document.createElement('tr');

        // Define valores padrão
        let dimComp = item.comp > 0 ? item.comp : '-';
        let dimAlt = item.alt > 0 ? item.alt : '-';
        let prodUn = '-';
        let numLaminas = '-';
        let solComp = '-';
        let tipoFechada = '-';
        let tipoTransv = '-';

        // Lógica condicional para preencher colunas
        if (isLamina) {
            // Lógica de Lâmina (existente)
            const alturaLaminaCM = upperName.includes('SUPER CANA') ? 10 : 7.5;
            numLaminas = Math.ceil((parseFloat(item.alt) * 100) / alturaLaminaCM);
            solComp = item.comp; // Comprimento da lâmina
            tipoFechada = upperName.includes('FECHADA') ? 'Sim' : '-';
            tipoTransv = upperName.includes('TRANSVISION') || upperName.includes('FURADA') ? 'Sim' : '-';
        
        } else if (isNeedsComp) {
            // Lógica para Tubo, Soleira
            prodUn = item.qtd;
            solComp = item.comp; // Comprimento do item
        
        } else if (isNeedsAlt) {
            // Lógica para Guia
            prodUn = item.qtd;
            // dimAlt já foi preenchido acima
        
        } else {
            // Outros itens (Motor, Controle, etc.)
            prodUn = item.qtd;
            dimComp = '-'; // Zera dimensões se não forem relevantes
            dimAlt = '-';
        }

        // Monta a linha da tabela
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
    // --- FIM DA LÓGICA ATUALIZADA ---

    // Adiciona linhas vazias se houver menos de 12 itens
    while (itemCounter <= 12) {
        producaoTableBody.innerHTML += `
            <tr class="empty-row">
                <td>${String(itemCounter++).padStart(3, '0')}</td>
                <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
            </tr>`;
    }
}