// js/config/constants.js

// ######################################################
// ### A CORREÇÃO DO "BUG DO CÁLCULO" ESTÁ AQUI ###
// ######################################################
// Esta lista agora contém PALAVRAS-CHAVE, e não nomes de produtos inteiros.
export const calcM2Slats = [
    'CANA GALVANIZADA',
    'CANA TRANSVISION',
    'SUPER CANA'
];
// ######################################################

export const needsCompItems = [
    'TUBO OCTOGONAL',
    'SOLEIRA',
    'BORRACHA SOLEIRA'
];
export const needsAltItems = [
    'GUIA LATERAL'
];

// --- Constantes de Configuração (Dados Estáticos) ---
export const empresasDB = [
    { id: 1, displayName: 'ATROX - SP', name: 'ATROX', address: 'Rua Mafra 375, Ipiranga - São Paulo/SP' },
    { id: 2, displayName: 'ATROX - MG', name: 'ATROX', address: 'Rua Presidente Getúlio Vargas 3765 - Itapeva/MG' },
    { id: 3, displayName: 'ATRON - SP', name: 'ATRON', address: 'Rua Mafra 375, Ipiranga - São Paulo/SP' },
    { id: 4, displayName: 'ATRON - MG', name: 'ATRON', address: 'Rua Presidente Getúlio Vargas 3765 - Itapeva/MG' }
];

const kitComumItens = [
    'Guia Lateral',
    'Tubo Octogonal',
    'Soleira',
    'Trava Lâmina',
    'Perfil PVC',
    'Borracha Soleira'
];
const kitAutoItens = [
    ...kitComumItens,
    'AC 200 (J) CONJUNTO',
    'Testeira',
    'Botoeira',
    'Antiqueda até 700kg (SB 404)',
    'Infravermelho',
    'Kit Controle'
];
export const kitsDB = {
    'todos': { name: '-- Sem Filtro de Kit --', items: [] },
    'comum': { name: 'Kit 1 - Porta Comum', items: kitComumItens },
    'auto': { name: 'Kit 2 - Porta Automatizada', items: kitAutoItens }
};