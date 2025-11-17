export const orcamento = {
    cliente: { nome: '', cnpj: '', endereco: '', numero: '', bairro: '', cidade: '', estado: '', cep: '', contato: '', email: '' },
    tipoCliente: null, // Será '1' (Serralheiro) ou '2' (Cliente Final)
    itens: []
};

// --- Outros Estados Globais (que não são do Store) ---
let _produtosDB = []; // Variável interna para a lista de produtos
export let lastCalculatedDimensions = { altura: 0, comprimento: 0, totalLaminas: 0 };


// --- Getters e Setters para produtosDB ---
export function getProdutosDB() {
    return [..._produtosDB]; // Retorna cópia
}
export function setProdutosDB(newProducts) {
    if (Array.isArray(newProducts)) {
        _produtosDB = [...newProducts];
        console.log("Estado produtosDB atualizado:", _produtosDB);
    } else {
        console.error("setProdutosDB recebeu dados inválidos:", newProducts);
        _produtosDB = ['Erro ao carregar dados']; // Mantém o fallback
    }
}