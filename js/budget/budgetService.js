// js/budget/budgetService.js
import { lastCalculatedDimensions } from '../state.js';
import { 
    calcM2Slats, needsCompItems, needsAltItems,
    DADOS_TECNICOS_LAMINAS, MOTORES_DISPONIVEIS, MAPA_TESTEIRAS 
} from '../config/constants.js';
import { buscarPrecoProduto } from '../api.js';
import { addItemToBudget } from '../store.js';

// --- CALCULADORA TÉCNICA INTERNA ---
const TechnicalCalculator = {
    
    calcularPesoPorta(altura, comprimento, nomeLamina) {
        const upperName = nomeLamina.toUpperCase();
        const chaveTecnica = Object.keys(DADOS_TECNICOS_LAMINAS).find(key => upperName.includes(key));
        const dados = DADOS_TECNICOS_LAMINAS[chaveTecnica];

        if (!dados) {
            console.warn("Dados técnicos não encontrados. Usando peso padrão.");
            return (altura * comprimento * 10) * 1.40; 
        }

        const qtdLaminas = Math.ceil((altura * 100) / dados.alturaCm);
        const pesoLona = qtdLaminas * (dados.fator * comprimento);
        
        return pesoLona * 1.40;
    },

    recomendarMotor(pesoTotalSeguranca) {
        const motor = MOTORES_DISPONIVEIS.find(m => m.peso >= pesoTotalSeguranca);
        return motor ? motor.nome : MOTORES_DISPONIVEIS[MOTORES_DISPONIVEIS.length - 1].nome;
    },

    recomendarTubo(comprimento, pesoTotal) {
        if (comprimento <= 6) return 'Tubo Octogonal'; 
        if (pesoTotal <= 700) return 'TUBO 4.1/2" 2.25mm (metro)'; 
        return 'TUBO 6.1/2" 2.65mm (metro)';
    },
    
    calcularTravasPorLado(altura, nomeLamina) {
        const upperName = nomeLamina.toUpperCase();
        const chaveTecnica = Object.keys(DADOS_TECNICOS_LAMINAS).find(key => upperName.includes(key));
        const dados = DADOS_TECNICOS_LAMINAS[chaveTecnica];
        
        if (!dados) return 1;

        const totalLaminas = Math.ceil((altura * 100) / dados.alturaCm);
        const travasPorLado = Math.ceil(totalLaminas / 4);
        const qtdPacotesPorLado = Math.ceil(travasPorLado / 25);
        
        return qtdPacotesPorLado > 0 ? qtdPacotesPorLado : 1;
    }
};

export async function handleAddItemSubmit(data) {
    let newItem;
    let itemsAddedNames = [];
    const { 
        descricao, alt, comp, vlr, unid, descPerc, 
        isCalcM2, needsComp, needsAlt, incluirRolo, selectedKitKey 
    } = data;

    // --- 1. Adiciona o Item Principal ---
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
        newItem = { descricao, comp: comp.toFixed(2), alt: 0, qtd: data.qtd || 1, unid: 'm', vlr: vlr || 0, descPerc: descPerc || 0 };
    } else if (needsAlt) {
        newItem = { descricao, comp: 0, alt: alt.toFixed(2), qtd: data.qtd || 1, unid: 'm', vlr: vlr || 0, descPerc: descPerc || 0 };
    } else {
        newItem = { descricao, comp: 0, alt: 0, qtd: data.qtd || 1, unid: unid, vlr: vlr || 0, descPerc: descPerc || 0 };
    }

    addItemToBudget(newItem);
    itemsAddedNames.push(newItem.descricao);


    // --- 2. GERAÇÃO DO KIT ---
    if (isCalcM2 && selectedKitKey !== 'todos') {
        
        const alturaVao = lastCalculatedDimensions.altura;
        const compVao = lastCalculatedDimensions.comprimento;
        const pesoTotal = TechnicalCalculator.calcularPesoPorta(alturaVao, compVao, newItem.descricao);

        let itensDesejados = [];
        const kitType = selectedKitKey;

        // --- ITENS COMUNS ---

        // 1. Soleira
        itensDesejados.push({ termo: 'SOLEIRA', tipo: 'linear', medida: compVao });
        
        // 2. Borracha (Unidade Fixa)
        itensDesejados.push({ termo: 'Borracha Soleira 10M', tipo: 'unidade', qtd: 1 });
        
        // 3. Guias (Altura - 50cm)
        const alturaGuia = Math.max(0, alturaVao - 0.50);
        itensDesejados.push({ termo: 'GUIA LATERAL', tipo: 'guia', medida: alturaGuia, qtd: 2 });
        
        // 4. Tubo
        const nomeTubo = TechnicalCalculator.recomendarTubo(compVao, pesoTotal);
        itensDesejados.push({ termo: nomeTubo, tipo: 'tubo', medida: compVao });
        
        // 5. Travas (Separadas Esq/Dir)
        const pacotesPorLado = TechnicalCalculator.calcularTravasPorLado(alturaVao, newItem.descricao);
        itensDesejados.push({ termo: 'Trava Lâmina Esquerdo (Pacote 25 unid.)', tipo: 'unidade', qtd: pacotesPorLado });
        itensDesejados.push({ termo: 'Trava Lâmina Direito (Pacote 25 unid.)', tipo: 'unidade', qtd: pacotesPorLado });
        
        // 6. PVC (Unidade Fixa)
        itensDesejados.push({ termo: 'Perfil PVC 50M', tipo: 'unidade', qtd: 1 });


        // --- ITENS AUTOMATIZADOS ---
        if (kitType === 'auto') {
            const nomeMotor = TechnicalCalculator.recomendarMotor(pesoTotal);
            itensDesejados.push({ termo: nomeMotor, tipo: 'unidade', qtd: 1 });
            
            // REMOVIDO: Testeira
            // const nomeTesteira = TechnicalCalculator.recomendarTesteira(nomeMotor);
            // itensDesejados.push({ termo: nomeTesteira, tipo: 'unidade', qtd: 1 });

            const nomeAntiqueda = pesoTotal > 700 ? 'Antiqueda até 2000kg (SB 708)' : 'Antiqueda até 700kg (SB 404)';
            itensDesejados.push({ termo: nomeAntiqueda, tipo: 'unidade', qtd: 1 });

            // REMOVIDO: Botoeira
            // itensDesejados.push({ termo: 'Botoeira', tipo: 'unidade', qtd: 1 });
            
            itensDesejados.push({ termo: 'Kit Controle', tipo: 'unidade', qtd: 1 });
            itensDesejados.push({ termo: 'Infravermelho', tipo: 'unidade', qtd: 1 });
        }

        // --- PROCESSAMENTO ---
        for (const req of itensDesejados) {
            if (newItem.descricao.toUpperCase().includes(req.termo.toUpperCase())) continue;

            const produtoInfo = await buscarPrecoProduto(req.termo);
            const preco = produtoInfo ? produtoInfo.preco : 0;
            const unidadeDB = produtoInfo ? (produtoInfo.unidade || 'un') : 'un';

            let finalComp = 0;
            let finalAlt = 0;
            let finalQtd = req.qtd || 1;
            let finalUnid = unidadeDB;

            if (req.tipo === 'linear') {
                finalComp = req.medida;
                finalUnid = 'm';
                finalQtd = 1;
            } 
            else if (req.tipo === 'guia') {
                finalAlt = req.medida;
                finalQtd = req.qtd;
                finalUnid = 'm';
            }
            else if (req.tipo === 'tubo') {
                if (req.termo.includes('Octogonal 4M')) {
                    finalComp = 0;
                    finalQtd = 1;
                    finalUnid = 'm'; // <--- ALTERADO DE 'barra' PARA 'm'
                } else {
                    finalComp = req.medida;
                    finalUnid = 'm';
                }
            }
            else if (req.tipo === 'unidade') {
                finalQtd = req.qtd;
                finalUnid = 'un';
            }

            const itemPronto = {
                descricao: req.termo + (produtoInfo?.erro ? ' (Verificar Cadastro)' : ''),
                comp: parseFloat(finalComp).toFixed(2),
                alt: parseFloat(finalAlt).toFixed(2),
                qtd: finalQtd,
                unid: finalUnid,
                vlr: preco,
                descPerc: 0
            };

            addItemToBudget(itemPronto);
            itemsAddedNames.push(itemPronto.descricao);
        }
    }
    
    return itemsAddedNames;
}