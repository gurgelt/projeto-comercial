<?php

//Configurações do Banco//

$servidor = "50.116.87.129";
$usuario = "atriu019_eduardo";
$senha = "GrupoAD7788";
$banco = "atriu019_comercial";

$conexao = new mysqli($servidor,$usuario,$senha,$banco);

//Verificar conexao//

if($conexao->connect_error){
    
    die("Falha na conexão: " . $conexao->connect_error);

}

//Definindo o padrão UTF8//

    $conexao->set_charset("utf8");


?>