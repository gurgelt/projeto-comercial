document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. ESTADO DA APLICAÇÃO E VARIÁVEIS GLOBAIS
    // =================================================================
    const orcamento = {
        cliente: {},
        tipoCliente: null,
        itens: [],
        descontoGeral: 0,
        frete: 0,
    };
    let produtosDB = [];

    // =================================================================
    // 2. SELETORES DE ELEMENTOS DO DOM (HTML)
    // =================================================================
    const startScreen = document.getElementById('start-screen');
    const mainContent = document.getElementById('main-content');
    const orcamentoModal = document.getElementById('orcamento-modal');
    const editOrcamentoModal = document.getElementById('edit-orcamento-modal');
    const clienteForm = document.getElementById('cliente-form');
    const itemForm = document.getElementById('item-form');
    const editOrcamentoForm = document.getElementById('edit-orcamento-form');
    const tableBody = document.getElementById('orcamento-table-body');
    const freteTipoSelect = document.getElementById('frete-tipo');
    const freteValorRow = document.getElementById('frete-valor-row');
    const freteValorInput = document.getElementById('frete-valor');
    const itemDescInput = document.getElementById('item-desc');
    const autocompleteList = document.getElementById('autocomplete-list');

    // =================================================================
    // 3. FUNÇÕES DE COMUNICAÇÃO COM O BACK-END (API)
    // =================================================================
    async function carregarProdutos() {
        try {
            const response = await fetch('api/buscar_produtos.php');
            if (!response.ok) throw new Error('Erro de rede ao buscar produtos');
            produtosDB = await response.json();
            console.log("Produtos Carregados:", produtosDB);
        } catch (error) {
            console.error("Falha ao carregar produtos:", error);
            produtosDB = ['Erro ao carregar produtos'];
        }
    }

    async function buscarPrecoProduto(nomeProduto) {
        if (!orcamento.tipoCliente) { alert("Erro: Tipo de cliente não definido."); return 0; }
        try {
            const response = await fetch(`api/buscar_preco_produto.php?produto=${encodeURIComponent(nomeProduto)}&tipo_cliente=${orcamento.tipoCliente}`);
            if (!response.ok) throw new Error('Erro de rede ao buscar preço');
            const data = await response.json();
            if (data.erro) throw new Error(data.erro);
            return data.preco || 0;
        } catch (error) {
            console.error("Falha ao buscar preço:", error);
            return 0;
        }
    }

    // =================================================================
    // 4. FUNÇÕES AUXILIARES (Formatação, etc.)
    // =================================================================
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    const parseCurrency = (value) => {
        if (typeof value === 'number') return value;
        return Number(String(value).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
    };
    const formatarCPFCNPJ = (input) => {
        if (!input) return;
        let value = input.value.replace(/\D/g, '');
        if (value.length > 14) value = value.substring(0, 14);
        value = value.length > 11
            ? value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
            : value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        input.value = value;
    };

    // =================================================================
    // 5. FUNÇÕES DE RENDERIZAÇÃO E CÁLCULO
    // =================================================================
    const renderInfo = () => {
        document.getElementById('cliente-nome-display').textContent = orcamento.cliente.nome || 'Não definido';
        document.getElementById('cliente-cnpj-display').textContent = orcamento.cliente.cnpj || 'Não definido';
        if (!document.getElementById('orcamento-num-display').textContent) {
            document.getElementById('orcamento-num-display').textContent = Math.floor(1000 + Math.random() * 9000);
        }
        if (!document.getElementById('orcamento-data-display').textContent) {
            document.getElementById('orcamento-data-display').textContent = new Date().toLocaleDateString('pt-BR');
        }
    };

    const renderTable = () => {
        tableBody.innerHTML = '';
        orcamento.itens.forEach((item, index) => {
            const totalItem = (item.qtd * item.vlr) * (1 - item.descPerc / 100);
            const row = document.createElement('tr');
            row.dataset.index = index;
            row.innerHTML = `
                <td>${String(index + 1).padStart(3, '0')}</td>
                <td data-field="descricao" class="editable-desc">${item.descricao}</td>
                <td contenteditable="true" data-field="comp">${item.comp}</td>
                <td contenteditable="true" data-field="alt">${item.alt}</td>
                <td contenteditable="true" data-field="qtd">${item.qtd}</td>
                <td contenteditable="true" data-field="unid">${item.unid}</td>
                <td contenteditable="true" data-field="vlr" class="currency">${item.vlr.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                <td contenteditable="true" data-field="descPerc" class="percentage">${item.descPerc}</td>
                <td>${formatCurrency(totalItem)}</td>
                <td class="no-print actions-cell">
                    <button class="btn-delete remove-item" title="Remover Item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </td>`;
            tableBody.appendChild(row);
        });
        recalcularTudo();
    };

    const recalcularTudo = () => {
        let subtotal = 0;
        orcamento.itens.forEach(item => {
            subtotal += (item.qtd * item.vlr) * (1 - item.descPerc / 100);
        });
        const descontoGeral = parseFloat(document.getElementById('desconto-geral').value) || 0;
        const valorFrete = parseCurrency(freteValorInput.value) || 0;
        const subtotalComDesconto = subtotal * (1 - descontoGeral / 100);
        const totalGeral = subtotalComDesconto + valorFrete;
        document.getElementById('subtotal').textContent = formatCurrency(subtotal);
        document.getElementById('total-geral').textContent = formatCurrency(totalGeral);
    };
    
    // =================================================================
    // 6. SETUP DE TODOS OS EVENT LISTENERS
    // =================================================================
    function setupEventListeners() {
        // --- Início e Modais ---
        document.getElementById('init-orcamento-btn').addEventListener('click', () => document.getElementById('client-type-modal').classList.add('active'));
        document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', (e) => e.target.closest('.modal-overlay').classList.remove('active')));
        const handleTipoClienteSelect = (e) => {
            orcamento.tipoCliente = e.target.dataset.tipo;
            console.log('ID do Tipo de Cliente selecionado:',orcamento.tipoCliente);
            
            document.getElementById('client-type-modal').classList.remove('active');
            startScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            orcamentoModal.classList.add('active');
            document.getElementById('modal-step-1').classList.remove('hidden');
            document.getElementById('modal-step-2').classList.add('hidden');
        };
        document.getElementById('tipo-serralheiro-btn').addEventListener('click', handleTipoClienteSelect);
        document.getElementById('tipo-cliente-final-btn').addEventListener('click', handleTipoClienteSelect);

        // --- Formulários ---
        clienteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            orcamento.cliente.nome = document.getElementById('cliente-nome').value;
            orcamento.cliente.cnpj = document.getElementById('cliente-cnpj').value;
            renderInfo();
            if (orcamento.itens.length === 0) {
                document.getElementById('modal-step-1').classList.add('hidden');
                document.getElementById('modal-step-2').classList.remove('hidden');
            } else {
                orcamentoModal.classList.remove('active');
            }
        });

        itemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newItem = {
                descricao: itemDescInput.value,
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
            itemDescInput.focus();
        });

        editOrcamentoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('orcamento-num-display').textContent = document.getElementById('orcamento-num-edit').value;
            document.getElementById('orcamento-data-display').textContent = document.getElementById('orcamento-data-edit').value;
            editOrcamentoModal.classList.remove('active');
        });

        // --- Botões de Ação ---
        document.getElementById('edit-cliente-btn').addEventListener('click', () => {
            document.getElementById('cliente-nome').value = orcamento.cliente.nome || '';
            document.getElementById('cliente-cnpj').value = orcamento.cliente.cnpj || '';
            formatarCPFCNPJ(document.getElementById('cliente-cnpj'));
            orcamentoModal.classList.add('active');
            document.getElementById('modal-step-1').classList.remove('hidden');
            document.getElementById('modal-step-2').classList.add('hidden');
        });

        document.getElementById('edit-orcamento-btn').addEventListener('click', () => {
            document.getElementById('orcamento-num-edit').value = document.getElementById('orcamento-num-display').textContent;
            document.getElementById('orcamento-data-edit').value = document.getElementById('orcamento-data-display').textContent;
            editOrcamentoModal.classList.add('active');
        });
        
        document.getElementById('add-item-btn').addEventListener('click', () => {
            orcamentoModal.classList.add('active');
            document.getElementById('modal-step-1').classList.add('hidden');
            document.getElementById('modal-step-2').classList.remove('hidden');
            itemDescInput.focus();
        });

        // --- Inputs e Frete ---
        document.getElementById('cliente-cnpj').addEventListener('input', (e) => formatarCPFCNPJ(e.target));
        document.getElementById('desconto-geral').addEventListener('input', recalcularTudo);
        freteTipoSelect.addEventListener('change', () => {
            freteValorRow.classList.toggle('hidden', freteTipoSelect.value !== 'Correio');
            if (freteTipoSelect.value !== 'Correio') freteValorInput.value = '0,00';
            recalcularTudo();
        });
        freteValorInput.addEventListener('input', recalcularTudo);

        // --- Lógica da Tabela (Edição, Remoção, Busca) ---
        tableBody.addEventListener('input', (e) => {
            if (e.target.isContentEditable) {
                const index = e.target.parentElement.dataset.index;
                const field = e.target.dataset.field;
                let value = e.target.textContent;
                if (field === 'vlr') value = parseCurrency(value);
                else if (field !== 'descricao' && field !== 'unid') value = parseFloat(value) || 0;
                orcamento.itens[index][field] = value;
                recalcularTudo();
            }
        });

        tableBody.addEventListener('click', (e) => {
            const removeItemBtn = e.target.closest('.remove-item');
            if (removeItemBtn) {
                const index = removeItemBtn.closest('tr').dataset.index;
                orcamento.itens.splice(index, 1);
                renderTable();
                return;
            }

            const descCell = e.target.closest('[data-field="descricao"]');
            if (descCell && !descCell.querySelector('input')) {
                const index = descCell.parentElement.dataset.index;
                const originalValue = orcamento.itens[index].descricao;
                descCell.innerHTML = `<div class="autocomplete-container-table"><input type="text" class="inline-edit-input" value="${originalValue}" /><ul class="autocomplete-list-table hidden"></ul></div>`;
                const input = descCell.querySelector('input');
                input.focus();
                
                input.addEventListener('input', () => {
                    const list = descCell.querySelector('ul');
                    const query = input.value.toLowerCase();
                    list.innerHTML = '';
                    if (!query) { list.classList.add('hidden'); return; }
                    const filtered = produtosDB.filter(p => p && p.toLowerCase().includes(query));
                    if (filtered.length > 0) {
                        list.classList.remove('hidden');
                        filtered.forEach(p => {
                            const li = document.createElement('li');
                            li.textContent = p;
                            li.addEventListener('mousedown', async () => {
                                orcamento.itens[index].descricao = p;
                                const newPrice = await buscarPrecoProduto(p);
                                orcamento.itens[index].vlr = newPrice;
                                renderTable();
                            });
                            list.appendChild(li);
                        });
                    }
                });

                input.addEventListener('blur', () => setTimeout(() => renderTable(), 150));
            }
        });
        
        // --- Autocomplete do Modal ---
        itemDescInput.addEventListener('input', () => {
            const query = itemDescInput.value.toLowerCase();
            autocompleteList.innerHTML = '';
            if (!query) { autocompleteList.classList.add('hidden'); return; }
            const filtered = produtosDB.filter(p => p && p.toLowerCase().includes(query));
            if (filtered.length > 0) {
                autocompleteList.classList.remove('hidden');
                filtered.forEach(p => {
                    const li = document.createElement('li');
                    li.textContent = p;
                    li.addEventListener('click', async () => {
                        itemDescInput.value = p;
                        autocompleteList.classList.add('hidden');
                        const preco = await buscarPrecoProduto(p);
                        document.getElementById('item-vlr').value = preco.toLocaleString('pt-BR', {minimumFractionDigits: 2});
                    });
                    autocompleteList.appendChild(li);
                });
            }
        });
        document.addEventListener('click', (e) => { if (e.target.id !== 'item-desc') autocompleteList.classList.add('hidden'); });
    }

    // =================================================================
    // 7. INICIALIZAÇÃO DA APLICAÇÃO
    // =================================================================
    function init() {
        carregarProdutos();
        setupEventListeners();
    }

    init();
});