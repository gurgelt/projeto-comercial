<?php
require_once 'conexao.php'; // Usa a conexão remota que você já configurou
header('Content-Type: application/json');

$nomeProduto = isset($_GET['produto']) ? $conexao->real_escape_string($_GET['produto']) : '';
$tipoClienteId = isset($_GET['tipo_cliente']) ? (int)$_GET['tipo_cliente'] : 0;

if (empty($nomeProduto) || $tipoClienteId === 0) {
    echo json_encode(['erro' => 'Parâmetros inválidos.']);
    exit;
}

$sql = "SELECT pr.preco
        FROM Preco AS pr
        JOIN Produto AS p ON pr.id_produto = p.id_produto
        WHERE p.nome = '$nomeProduto' AND pr.id_tp_cliente = $tipoClienteId";

$resultado = $conexao->query($sql);

$precoFinal = ['preco' => 0.00];

if ($resultado && $resultado->num_rows > 0) {
    $linha = $resultado->fetch_assoc();
    $precoFinal['preco'] = (float)$linha['preco'];
}

$conexao->close();

echo json_encode($precoFinal);
?>