<?php
require_once 'conexao.php'; 
header('Content-Type: application/json');

// --- PASSO 1: Limpa os espaços em branco da entrada ---
$nomeProduto_bruto = isset($_GET['produto']) ? $_GET['produto'] : '';
$nomeProduto_limpo = trim($nomeProduto_bruto);

$nomeProduto = $conexao->real_escape_string($nomeProduto_limpo);
$tipoClienteId = isset($_GET['tipo_cliente']) ? (int)$_GET['tipo_cliente'] : 0;

$response = ['erro' => 'Produto não encontrado ou tipo de cliente inválido'];
$debug_info = [
    'raw_produto_get' => $nomeProduto_bruto,
    'raw_tipo_get' => $_GET['tipo_cliente'] ?? 'N/A',
    'produto_limpo_escapado' => $nomeProduto
];

if (empty($nomeProduto) || $tipoClienteId === 0) {
    $response = ['erro' => 'Parâmetros inválidos.'];
    echo json_encode($response);
    exit;
}

// --- SOLUÇÃO: Busca mais flexível usando LIKE ---
$sql = "SELECT 
            pr.preco,
            u.desc_unid
        FROM Preco AS pr
        JOIN Produto AS p ON pr.id_produto = p.id_produto
        LEFT JOIN Unid_Medida AS u ON p.id_unid = u.id_unid
        WHERE 
            (TRIM(p.nome) = '$nomeProduto' 
             OR p.nome LIKE '%$nomeProduto%'
             OR REPLACE(p.nome, '/', ' ') LIKE '%$nomeProduto%')
            AND pr.id_tp_cliente = $tipoClienteId
        LIMIT 1";

$debug_info['sql_query'] = $sql;
$resultado = $conexao->query($sql);

if ($resultado && $resultado->num_rows > 0) {
    $linha = $resultado->fetch_assoc();
    $response = [
        'preco' => (float)$linha['preco'],
        'unidade' => $linha['desc_unid']
    ];
} else {
    // Se ainda falhar, tenta uma busca mais ampla
    $sql_fallback = "SELECT 
                        pr.preco,
                        u.desc_unid
                    FROM Preco AS pr
                    JOIN Produto AS p ON pr.id_produto = p.id_produto
                    LEFT JOIN Unid_Medida AS u ON p.id_unid = u.id_unid
                    WHERE 
                        p.nome LIKE '%".explode(' ', $nomeProduto)[0]."%'
                        AND pr.id_tp_cliente = $tipoClienteId
                    LIMIT 1";
    
    $debug_info['sql_fallback'] = $sql_fallback;
    $resultado_fallback = $conexao->query($sql_fallback);
    
    if ($resultado_fallback && $resultado_fallback->num_rows > 0) {
        $linha = $resultado_fallback->fetch_assoc();
        $response = [
            'preco' => (float)$linha['preco'],
            'unidade' => $linha['desc_unid']
        ];
    } else {
        // Se falhar, anexa o debug
        $response['debug_info'] = $debug_info;
    }
}

$conexao->close();

echo json_encode($response);
?>