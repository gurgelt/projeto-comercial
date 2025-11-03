// js/api.js
import { setProdutosDB, orcamento } from './state.js'; // Importa setter e orcamento

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
    if (!orcamento.tipoCliente) {
        alert("Tipo de cliente não definido.");
        return null;
    }
    try {
        const response = await fetch(`api/buscar_preco_produto.php?produto=${encodeURIComponent(nomeProduto)}&tipo_cliente=${orcamento.tipoCliente}`);
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