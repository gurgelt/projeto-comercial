document.addEventListener('DOMContentLoaded', () => {

    // --- Estado da Aplicação ---
    // Adicionamos o 'tipoCliente' para rastrear o tipo de orçamento.
    const orcamento = {
        cliente: {},
        tipoCliente: null, // 1 para Cliente Final, 2 para Serralheiro
        itens: [],
        descontoGeral: 0,
    };

    let produtosDB = [];

    // --- Funções de Carregamento de Dados (Back-end) ---
    async function carregarProdutos() {
        try {
            // A query em buscar_produtos.php deve retornar o 'nome' do produto, não a 'descricao'. Ajuste no PHP se necessário.
            const response = await fetch('api/buscar_produtos.php');
            if (!response.ok) {
                throw new Error('Erro de rede ao buscar produtos');
            }
            produtosDB = await response.json();
            console.log("Produtos Carregados:", produtosDB);
        } catch (error) {
            console.error("Falha ao carregar produtos:", error);
            produtosDB = ['Erro ao carregar produtos'];
        }
    }

    async function buscarPrecoProduto(nomeProduto) {
        if (!orcamento.tipoCliente) {
            alert("Erro: Tipo de cliente não definido.");
            return 0;
        }
        try {
            const response = await fetch(`api/buscar_preco_produto.php?produto=${encodeURIComponent(nomeProduto)}&tipo_cliente=${orcamento.tipoCliente}`);
            if(!response.ok) {
                throw new Error('Erro de rede ao buscar preço');
            }
            const data = await response.json();
            return data.preco || 0;
        } catch(error) {
            console.error("Falha ao buscar preço:", error);
            return 0;
        }
    }

    // Carrega a lista de produtos assim que a página é carregada.
    carregarProdutos();

    // --- Seletores de Elementos ---
    const startScreen = document.getElementById('start-screen');
    const mainContent = document.getElementById('main-content');
    
    // Modais
    const clientTypeModal = document.getElementById('client-type-modal');
    const orcamentoModal = document.getElementById('orcamento-modal');
    const modalStep1 = document.getElementById('modal-step-1');
    const modalStep2 = document.getElementById('modal-step-2');
    
    // Botões
    const initOrcamentoBtn = document.getElementById('init-orcamento-btn');
    const closeButtons = document.querySelectorAll('.close-modal');
    const tipoSerralheiroBtn = document.getElementById('tipo-serralheiro-btn');
    const tipoClienteFinalBtn = document.getElementById('tipo-cliente-final-btn');
    const voltarBtn = document.getElementById('voltar-btn');
    const addItemBtn = document.getElementById('add-item-btn');
    const editClienteBtn = document.getElementById('edit-cliente-btn');

    // Formulários
    const clienteForm = document.getElementById('cliente-form');
    const itemForm = document.getElementById('item-form');
    
    // Input de CNPJ/CPF para máscara
    const clienteCnpjInput = document.getElementById('cliente-cnpj');


    // --- Funções de Formatação e Validação ---
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const parseCurrency = (value) => {
        if (typeof value === 'number') return value;
        return Number(String(value).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
    };
    
    // **NOVO: Função para máscara de CPF/CNPJ**
    const formatarCPFCNPJ = (input) => {
        let value = input.value.replace(/\D/g, ''); // Remove tudo que não é dígito
        
        if (value.length > 14) {
            value = value.substring(0, 14);
        }

        if (value.length > 11) {
            // CNPJ
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        } else {
            // CPF
            value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        input.value = value;
    };


    // --- Funções do Modal ---
    const showModal = (modalElement) => modalElement.classList.add('active');
    const hideModal = (modalElement) => modalElement.classList.remove('active');

    const resetAndShowOrcamentoModal = (step = 1) => {
        showModal(orcamentoModal);
        if (step === 1) {
            modalStep1.classList.remove('hidden');
            modalStep2.classList.add('hidden');
            // Preenche o formulário com dados existentes para edição
            document.getElementById('cliente-nome').value = orcamento.cliente.nome || '';
            clienteCnpjInput.value = orcamento.cliente.cnpj || '';
        } else {
            modalStep1.classList.add('hidden');
            modalStep2.classList.remove('hidden');
        }
    };


    // --- Funções de Renderização na Tela ---
    const renderInfo = () => {
        document.getElementById('cliente-nome-display').textContent = orcamento.cliente.nome || 'Não definido';
        document.getElementById('cliente-cnpj-display').textContent = orcamento.cliente.cnpj || 'Não definido';
        if(!document.getElementById('orcamento-num-display').textContent) {
            document.getElementById('orcamento-num-display').textContent = Math.floor(1000 + Math.random() * 9000);
        }
        if(!document.getElementById('orcamento-data-display').textContent) {
            document.getElementById('orcamento-data-display').textContent = new Date().toLocaleDateString('pt-BR');
        }
    };

    const renderTable = () => {
        const tableBody = document.getElementById('orcamento-table-body');
        tableBody.innerHTML = '';
        orcamento.itens.forEach((item, index) => {
            // **CORREÇÃO CRÍTICA**: O cálculo agora usa `item.descPerc`
            const totalItem = (item.qtd * item.vlr) * (1 - item.descPerc / 100);
            const row = document.createElement('tr');
            row.dataset.index = index;
            // **CORREÇÃO CRÍTICA**: Os campos `data-field` e o conteúdo da célula foram corrigidos
            row.innerHTML = `
                <td>${String(index + 1).padStart(3, '0')}</td>
                <td contenteditable="true" data-field="descricao">${item.descricao}</td>
                <td contenteditable="true" data-field="comp">${item.comp}</td>
                <td contenteditable="true" data-field="alt">${item.alt}</td>
                <td contenteditable="true" data-field="qtd">${item.qtd}</td>
                <td contenteditable="true" data-field="unid">${item.unid}</td>
                <td contenteditable="true" data-field="vlr" class="currency">${item.vlr.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td contenteditable="true" data-field="descPerc" class="percentage">${item.descPerc}</td>
                <td>${formatCurrency(totalItem)}</td>
                <td class="no-print actions-cell">
                    <button class="remove-item" style="background:none; border:none; cursor:pointer; color: #ef4444;" title="Remover Item">&times;</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        recalcularTudo();
    };


    // --- Funções de Cálculo ---
    const recalcularTudo = () => {
        let subtotal = 0;
        orcamento.itens.forEach(item => {
            // **CORREÇÃO CRÍTICA**: O cálculo agora usa `item.descPerc`
            subtotal += (item.qtd * item.vlr) * (1 - item.descPerc / 100);
        });
        
        orcamento.descontoGeral = parseFloat(document.getElementById('desconto-geral').value) || 0;
        const totalGeral = subtotal * (1 - orcamento.descontoGeral / 100);

        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('total-geral').textContent = formatCurrency(totalGeral);
    };


    // --- Event Listeners ---

    // 1. Início: Botão "Criar Orçamento"
    initOrcamentoBtn.addEventListener('click', () => {
        showModal(clientTypeModal);
    });

    // 2. Seleção do Tipo de Cliente
    const handleTipoClienteSelect = (e) => {
        orcamento.tipoCliente = e.target.dataset.tipo;
        console.log(`Tipo de Cliente selecionado: ${orcamento.tipoCliente}`);
        hideModal(clientTypeModal);
        
        startScreen.classList.add('hidden');
        mainContent.classList.remove('hidden');

        resetAndShowOrcamentoModal(1);
    };
    tipoSerralheiroBtn.addEventListener('click', handleTipoClienteSelect);
    tipoClienteFinalBtn.addEventListener('click', handleTipoClienteSelect);
    
    // 3. Fechar qualquer modal
    closeButtons.forEach(btn => btn.addEventListener('click', () => {
        hideModal(clientTypeModal);
        hideModal(orcamentoModal);
    }));
    
    // 4. Formulário do Cliente (Etapa 1)
    clienteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        orcamento.cliente.nome = document.getElementById('cliente-nome').value;
        orcamento.cliente.cnpj = clienteCnpjInput.value;
        renderInfo();
        modalStep1.classList.add('hidden');
        modalStep2.classList.remove('hidden');
    });

    // 5. Botão Voltar (do Item para Cliente)
    voltarBtn.addEventListener('click', () => {
        modalStep2.classList.add('hidden');
        modalStep1.classList.remove('hidden');
    });
    
    // 6. Formulário de Item (Etapa 2)
    itemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // **CORREÇÃO CRÍTICA**: O objeto `newItem` foi corrigido para usar os campos corretos.
        const newItem = {
            descricao: document.getElementById('item-desc').value,
            comp: parseFloat(document.getElementById('item-comp').value) || 0,
            alt: parseFloat(document.getElementById('item-alt').value) || 0,
            qtd: parseFloat(document.getElementById('item-qtd').value) || 1,
            unid: document.getElementById('item-unid').value,
            vlr: parseCurrency(document.getElementById('item-vlr').value) || 0,
            descPerc: parseFloat(document.getElementById('item-desc-perc').value) || 0
        };
        orcamento.itens.push(newItem);
        renderTable();
        itemForm.reset();
        document.getElementById('item-desc').focus();
    });

    // 7. **NOVO**: Listener para máscara de CPF/CNPJ
    clienteCnpjInput.addEventListener('input', () => formatarCPFCNPJ(clienteCnpjInput));

    // 8. **NOVO**: Botão para adicionar mais itens após a criação inicial
    addItemBtn.addEventListener('click', () => {
        resetAndShowOrcamentoModal(2); // Abre direto na etapa 2
    });

    // 9. **NOVO**: Botão para editar dados do cliente
    editClienteBtn.addEventListener('click', () => {
        resetAndShowOrcamentoModal(1); // Abre na etapa 1 para edição
    });
            
    // 10. Edição inline na tabela
    document.getElementById('orcamento-table-body').addEventListener('input', (e) => {
        if (e.target.isContentEditable) {
            const index = e.target.parentElement.dataset.index;
            const field = e.target.dataset.field;
            let value = e.target.textContent;

            // **CORREÇÃO CRÍTICA**: `field` agora é 'descricao' ou 'descPerc', etc.
            if (field === 'vlr') {
                value = parseCurrency(value);
            } else if (field !== 'descricao' && field !== 'unid') { // 'descricao' e 'unid' são strings
                value = parseFloat(value) || 0;
            }
            
            orcamento.itens[index][field] = value;
            recalcularTudo();
        }
    });

    // 11. Remover item da tabela
    document.getElementById('orcamento-table-body').addEventListener('click', (e) => {
        if(e.target.classList.contains('remove-item')) {
            const index = e.target.closest('tr').dataset.index;
            orcamento.itens.splice(index, 1);
            renderTable();
        }
    });
    
    // 12. Recalcular ao mudar desconto geral
    document.getElementById('desconto-geral').addEventListener('input', recalcularTudo);
    
    // --- Lógica do Autocomplete ---
    const itemDescInput = document.getElementById('item-desc');
    const autocompleteList = document.getElementById('autocomplete-list');
    
    itemDescInput.addEventListener('input', () => {
        const query = itemDescInput.value.toLowerCase();
        autocompleteList.innerHTML = '';
        if (!query) {
            autocompleteList.classList.add('hidden');
            return;
        }
        
        const filtered = produtosDB.filter(p => p.toLowerCase().includes(query));
        
        if (filtered.length > 0) {
            autocompleteList.classList.remove('hidden');
            filtered.forEach(p => {
                const li = document.createElement('li');
                li.textContent = p;
                li.addEventListener('click', async () => {
                    itemDescInput.value = p;
                    autocompleteList.classList.add('hidden');
                    
                    // **NOVA FUNCIONALIDADE**: Busca o preço automaticamente
                    const preco = await buscarPrecoProduto(p);
                    document.getElementById('item-vlr').value = preco.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                });
                autocompleteList.appendChild(li);
            });
        } else {
            autocompleteList.classList.add('hidden');
        }
    });
    
    // Fechar autocomplete se clicar fora
    document.addEventListener('click', (e) => {
        if (e.target.id !== 'item-desc') {
            autocompleteList.classList.add('hidden');
        }
    });
});