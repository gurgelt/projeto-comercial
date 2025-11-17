// js/api.js
// ######################################################
// ### MUDANÇA (Importações) ###
// ######################################################
import { setProdutosDB } from './state.js'; 
import { getTipoCliente } from './store.js'; // Importa o getter do store
// ######################################################

export async function carregarProdutos() {
    try {
        const response = await fetch('api/buscar_produtos.php');
        if (!response.ok) throw new Error('Erro de rede');
        const data = await response.json();
        setProdutosDB(data); // Usa o setter
    } catch (error) {
        console.error("Falha ao carregar produtos:", error);
        setProdutosDB(['Erro ao carregar']); // Define estado de erro via setter
    }
}

export async function buscarPrecoProduto(nomeProduto) {
    // ######################################################
    // ### MUDANÇA (Lógica) ###
    // ######################################################
    const tipoCliente = getTipoCliente(); // Usa o getter do store
    // ######################################################

    if (!tipoCliente) {
        alert("Tipo de cliente não definido.");
        return null;
    }
    try {
        const response = await fetch(`api/buscar_preco_produto.php?produto=${encodeURIComponent(nomeProduto)}&tipo_cliente=${tipoCliente}`); // Usa a variável local
        if (!response.ok) throw new Error('Erro de rede');
        const data = await response.json();
        if (data.erro) {
            console.error("Produto sem preço:", nomeProduto, data);
            // Retorna um objeto indicando o erro, mas com valores padrão
            return { preco: 0, unidade: 'un', erro: true };
        }
        return data; // Retorna { preco: ..., unidade: ... }
    } catch (error) {
        console.error("Falha ao buscar preço:", error);
        return null; // Indica falha na requisição
    }
}