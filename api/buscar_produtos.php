<?php

require_once 'conexao.php';

//Define o cabeçalho da resposta como JSON//
header('Content-Type: application/json');

$produtos = [];

$sql = "SELECT descricao FROM Produto ORDER BY descricao ASC";

$resultado = $conexao->query($sql);

if ($resultado && $resultado->num_rows > 0){
    // Loop através de cada linha de resultado//

    while($linha = $resultado->fetch_assoc()){
        //Adiona a descrição do produto no array
        $produto[] = $linha['descricao'];
    }
}

$conexao->close();

echo json_encode($produto);

?>