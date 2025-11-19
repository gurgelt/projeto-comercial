// js/config/constants.js

// --- Palavras-chave para Lógica de Negócio ---
export const calcM2Slats = [
    'CANA GALVANIZADA',
    'CANA TRANSVISION',
    'SUPER CANA'
];

export const needsCompItems = [
    'TUBO OCTOGONAL',
    'SOLEIRA',
    'BORRACHA SOLEIRA'
];

export const needsAltItems = [
    'GUIA LATERAL'
];

// --- Dados Técnicos para Cálculos Automáticos ---
// FATOR = KG por Metro Linear da lâmina (Ajustado para realidade de mercado)
export const DADOS_TECNICOS_LAMINAS = {
    '1/2 CANA GALVANIZADA': { fator: 0.95, alturaCm: 7.5 }, // Aprox 0.95kg por metro linear
    '1/2 CANA TRANSVISION': { fator: 0.85, alturaCm: 7.5 },
    'SUPER CANA': { fator: 1.35, alturaCm: 10.0 }
};

// Lista ordenada por CAPACIDADE DE CARGA (Peso)
// Nomes exatos conforme seu SQL
export const MOTORES_DISPONIVEIS = [
    { peso: 200, nome: 'AC 200 (J) CONJUNTO' },
    { peso: 300, nome: 'AC 300 (J) CONJUNTO' },
    { peso: 400, nome: 'AC 400 (J) CONJUNTO' },
    { peso: 500, nome: 'AC 500 (J) CONJUNTO' },
    { peso: 600, nome: 'AC 600 (J) CONJUNTO' },
    { peso: 700, nome: 'AC 700 (J) CONJUNTO' },
    { peso: 800, nome: 'AC 800 (J) CONJUNTO' },
    { peso: 1000, nome: 'AC 1000 (J) CONJUNTO' },
    { peso: 1500, nome: 'AC 1500 (J) (220v ou 380v) CONJUNTO' },
    { peso: 2000, nome: 'AC 2000 (J) (220v ou 380v) CONJUNTO' }
];

export const MAPA_TESTEIRAS = {
    'AC 200': 'Testeira 330x330', // Ajuste conforme seu SQL se tiver nomes específicos
    'AC 300': 'Testeira 330x330', 
    'AC 400': 'Testeira 330x330',
    'AC 500': 'Testeira 330x330',
    'AC 600': 'Testeira 400x400',
    'AC 700': 'Testeira 400x400',
    'AC 800': 'Testeira 400x400',
    'AC 1000': 'Testeira 450x450', // Exemplo
    'DEFAULT': 'Testeira Padrão' // Fallback
};

// ... (Mantenha empresasDB e kitsDB como estavam) ...
export const empresasDB = [
    { id: 1, displayName: 'ATROX - SP', name: 'ATROX', address: 'Rua Mafra 375, Ipiranga - São Paulo/SP' },
    { id: 2, displayName: 'ATROX - MG', name: 'ATROX', address: 'Rua Presidente Getúlio Vargas 3765 - Itapeva/MG' },
    { id: 3, displayName: 'ATRON - SP', name: 'ATRON', address: 'Rua Mafra 375, Ipiranga - São Paulo/SP' },
    { id: 4, displayName: 'ATRON - MG', name: 'ATRON', address: 'Rua Presidente Getúlio Vargas 3765 - Itapeva/MG' }
];

const kitComumItens = [
    'Guia Lateral',
    'Tubo Octogonal 5M',
    'Soleira',
    'Trava Lâmina',
    'Perfil PVC 50M',
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