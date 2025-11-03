// js/utils.js

export const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const parseCurrency = (value) => {
    if (typeof value === 'number') return value;
    // Remove pontos, troca vírgula por ponto, remove caracteres não numéricos exceto '-'
    return Number(String(value).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
};

export const formatarCPFCNPJ = (input) => {
    if (!input) return;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 14) value = value.substring(0, 14);
    // Formata CNPJ ou CPF
    value = value.length > 11
        ? value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        : value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    input.value = value;
};

export function hideAllAutocompletes() {
    document.querySelectorAll('.autocomplete-list').forEach(list => list.classList.add('hidden'));
}