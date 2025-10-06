<?php

// Inclui a conexão com o banco de dados.
// Verifique se o caminho para o arquivo conexao.php está correto após a reorganização.
require_once 'conexao.php';

// Define o cabeçalho da resposta como JSON, essencial para a comunicação correta.
header('Content-Type: application/json');

// 1. Inicia um array PHP vazio. É crucial que seja um array simples.
$listaDeProdutos = [];

// 2. A consulta SQL busca apenas a coluna 'nome' dos produtos.
$sql = "SELECT nome FROM Produto ORDER BY nome ASC";

$resultado = $conexao->query($sql);

// 3. O resultado da busca é percorrido e cada nome é adicionado ao array.
if ($resultado && $resultado->num_rows > 0) {
    while($linha = $resultado->fetch_assoc()) {
        // A sintaxe $listaDeProdutos[] garante que estamos adicionando itens a um array indexado.
        $listaDeProdutos[] = $linha['nome'];
    }
}

$conexao->close();

// 4. A função json_encode transforma o array PHP em um array JSON puro.
// Ex: ["AC200", "Chapa Testeira", "Guia de 70"]
echo json_encode($listaDeProdutos);

?>