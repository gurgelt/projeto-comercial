document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. ESTADO DA APLICAÇÃO E DADOS GLOBAIS
    // =================================================================
    const orcamento = {
        cliente: {
            nome: '',
            cnpj: '',
            endereco: '',
            numero: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
            contato: '',
            email: ''
        },
        tipoCliente: null,
        itens: []
    };
    let produtosDB = [];
    let lastCalculatedDimensions = {
        altura: 0,
        comprimento: 0,
        totalLaminas: 0
    };
    const calculableSlats = [
        '1/2 CANA GALVANIZADA (FECHADA)',
        '1/2 CANA TRANSVISION (FURADA)',
        'SUPER CANA'
    ];
    const empresasDB = [{
        id: 1,
        displayName: 'Atrox - SP',
        name: 'Atrox',
        address: 'Rua Mafra 375, Ipiranga - São Paulo/SP'
    }, {
        id: 2,
        displayName: 'Atrox - MG',
        name: 'Atrox',
        address: 'Rua Presidente Getúlio Vargas 3765 - Itapeva/MG'
    }, {
        id: 3,
        displayName: 'Atron - SP',
        name: 'Atron',
        address: 'Rua Mafra 375, Ipiranga - São Paulo/SP'
    }, {
        id: 4,
        displayName: 'Atron - MG',
        name: 'Atron',
        address: 'Rua Presidente Getúlio Vargas 3765 - Itapeva/MG'
    }];
    const kitsDB = {
        'todos': {
            name: '-- Sem Filtro de Kit --',
            keywords: []
        },
        'comum': {
            name: 'Kit 1 - Porta Comum',
            items: ['CANA', 'GUIA', 'SOLEIRA', 'EIXO', 'TRAVA']
        },
        'auto': {
            name: 'Kit 2 - Porta Automatizada',
            items: ['CANA', 'GUIA', 'SOLEIRA', 'EIXO', 'TRAVA', 'MOTOR', 'CHAPA', 'CENTRAL', 'NOBREAK', 'CONTROLE']
        }
    };

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
    const itemAltInput = document.getElementById('item-alt');
    const itemCompInput = document.getElementById('item-comp');
    const incluirRoloCheck = document.getElementById('incluir-rolo-check');
    const voltarBtn = document.getElementById('voltar-btn');
    const itemQtdInput = document.getElementById('item-qtd');
    const itemUnidInput = document.getElementById('item-unid');
    const itemVlrInput = document.getElementById('item-vlr');
    const empresaSelect = document.getElementById('empresa-select');
    const companyNameDisplay = document.getElementById('company-name');
    const companyAddressDisplay = document.getElementById('company-address');
    const clienteInputs = {
        nome: document.getElementById('cliente-nome'),
        cnpj: document.getElementById('cliente-cnpj'),
        endereco: document.getElementById('cliente-endereco'),
        numero: document.getElementById('cliente-numero'),
        bairro: document.getElementById('cliente-bairro'),
        cidade: document.getElementById('cliente-cidade'),
        estado: document.getElementById('cliente-estado'),
        cep: document.getElementById('cliente-cep'),
        contato: document.getElementById('cliente-contato'),
        email: document.getElementById('cliente-email')
    };
    const kitSelect = document.getElementById('kit-select');
    const btnAdicionarKit = document.getElementById('btn-adicionar-kit'); // Seletor do botão reintroduzido

    // =================================================================
    // 3. FUNÇÕES DE COMUNICAÇÃO COM O BACK-END (API)
    // =================================================================
    async function carregarProdutos() {
        try {
            const response = await fetch('api/buscar_produtos.php');
            if (!response.ok) throw new Error('Erro de rede');
            produtosDB = await response.json();
            console.log("Produtos Carregados:", produtosDB);
        } catch (error) {
            console.error("Falha ao carregar produtos:", error);
            produtosDB = ['Erro ao carregar'];
        }
    }
    async function buscarPrecoProduto(nomeProduto) {
        if (!orcamento.tipoCliente) {
            alert("Tipo de cliente não definido.");
            return null;
        }

            console.log(`Buscando preço para: Produto='${nomeProduto}', Tipo Cliente ID='${orcamento.tipoCliente}'`);        
    try {
            const response = await fetch(`api/buscar_preco_produto.php?produto=${encodeURIComponent(nomeProduto)}&tipo_cliente=${orcamento.tipoCliente}`);
            if (!response.ok) throw new Error('Erro de rede');
            const data = await response.json();
            if (data.erro) {
                return null;
            }
            return data;
        } catch (error) {
            console.error("Falha ao buscar preço:", error);
            return null;
        }
    }

    // =================================================================
    // 4. FUNÇÕES AUXILIARES
    // =================================================================
    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
    const parseCurrency = (value) => {
        if (typeof value === 'number') return value;
        return Number(String(value).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
    };
    const formatarCPFCNPJ = (input) => {
        if (!input) return;
        let value = input.value.replace(/\D/g, '');
        if (value.length > 14) value = value.substring(0, 14);
        value = value.length > 11 ? value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        input.value = value;
    };

    // =================================================================
    // 5. LÓGICA DO FORMULÁRIO DE ITEM (CÁLCULO E ESTADO)
    // =================================================================
    function gerenciarEstadoFormularioItem(isCalculable) {
        itemQtdInput.disabled = isCalculable;
        itemUnidInput.disabled = isCalculable;
        itemVlrInput.disabled = isCalculable;
    }

    function calcularEAtualizarCamposPorta() {
        const descricao = itemDescInput.value;
        const isCalculable = calculableSlats.some(slatName => descricao.includes(slatName)); //Verificar aqui
        if (!isCalculable) {
            itemQtdInput.value = itemQtdInput.value || '';
            return;
        }
        let alturaM = parseFloat(itemAltInput.value);
        const comprimentoM = parseFloat(itemCompInput.value);
        if (isNaN(alturaM) || alturaM <= 0 || isNaN(comprimentoM) || comprimentoM <= 0) {
            itemQtdInput.value = '';
            return;
        }
        let alturaFinal = alturaM;
        if (incluirRoloCheck.checked) {
            alturaFinal += 0.60;
        }
        const larguraFinal = comprimentoM;
        const areaTotalM2 = alturaFinal * larguraFinal;
        itemQtdInput.value = areaTotalM2.toFixed(2);
        itemUnidInput.value = 'm²';
    }

    // =================================================================
    // 6. FUNÇÕES DE RENDERIZAÇÃO E CÁLCULO GERAL
    // =================================================================
    const renderInfo = () => {
        document.getElementById('cliente-nome-display').textContent = orcamento.cliente.nome || '';
        document.getElementById('cliente-cnpj-display').textContent = orcamento.cliente.cnpj || '';
        const enderecoCompleto = [orcamento.cliente.endereco, orcamento.cliente.numero, orcamento.cliente.bairro].filter(Boolean).join(', ');
        document.getElementById('cliente-endereco-display').textContent = enderecoCompleto;
        const cidadeUF = [orcamento.cliente.cidade, orcamento.cliente.estado].filter(Boolean).join(' - ');
        document.getElementById('cliente-cidade-uf-display').textContent = cidadeUF;
        document.getElementById('cliente-contato-display').textContent = orcamento.cliente.contato || '';
        document.getElementById('cliente-email-display').textContent = orcamento.cliente.email || '';
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
            row.innerHTML = `<td>${String(index + 1).padStart(3, '0')}</td><td contenteditable="true" data-field="descricao">${item.descricao}</td><td contenteditable="true" data-field="comp">${item.comp}</td><td contenteditable="true" data-field="alt">${item.alt}</td><td contenteditable="true" data-field="qtd">${item.qtd}</td><td contenteditable="true" data-field="unid">${item.unid}</td><td contenteditable="true" data-field="vlr" class="currency">${item.vlr.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td><td contenteditable="true" data-field="descPerc" class="percentage">${item.descPerc}</td><td>${formatCurrency(totalItem)}</td><td class="no-print actions-cell"><button class="btn-delete remove-item" title="Remover Item"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg></button></td>`;
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
    // 7. FUNÇÕES DE GERENCIAMENTO (EMPRESA E KITS)
    // =================================================================
    function popularEmpresasSelect() {
        empresasDB.forEach(empresa => {
            const option = document.createElement('option');
            option.value = empresa.id;
            option.textContent = empresa.displayName;
            empresaSelect.appendChild(option);
        });
    }

    function atualizarDadosEmpresa() {
        const selectedId = parseInt(empresaSelect.value);
        const empresaSelecionada = empresasDB.find(emp => emp.id === selectedId);
        if (empresaSelecionada) {
            companyNameDisplay.textContent = empresaSelecionada.name;
            companyAddressDisplay.textContent = empresaSelecionada.address;
        }
    }

    function popularKitsSelect() {
        for (const key in kitsDB) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = kitsDB[key].name;
            kitSelect.appendChild(option);
        }
    }
    async function adicionarKitAoOrcamento() {
        const selectedKitId = kitSelect.value;
        if (!selectedKitId || selectedKitId === 'todos') {
            alert('Selecione um kit válido.');
            return;
        }
        const kitSelecionado = kitsDB[selectedKitId];
        if (!kitSelecionado) return;
        alert(`Adicionando itens do "${kitSelecionado.name}".\nEdite os itens marcados como (EDITAR).`);
        for (const itemName of kitSelecionado.items) {
            const produtoInfo = await buscarPrecoProduto(itemName.split(' ')[0]);
            const preco = produtoInfo ? produtoInfo.preco : 0;
            const unidade = produtoInfo ? (produtoInfo.unidade || 'un') : 'un';
            const newItem = {
                descricao: itemName,
                comp: 0,
                alt: 0,
                qtd: 1,
                unid: unidade,
                vlr: preco,
                descPerc: 0
            };
            orcamento.itens.push(newItem);
        }
        renderTable();
        orcamentoModal.classList.remove('active');
        kitSelect.value = "todos";
    }

    // =================================================================
    // 8. SETUP DE TODOS OS EVENT LISTENERS
    // =================================================================
    function setupEventListeners() {
        empresaSelect.addEventListener('change', atualizarDadosEmpresa);
        document.getElementById('init-orcamento-btn').addEventListener('click', () => document.getElementById('client-type-modal').classList.add('active'));
        document.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', (e) => e.target.closest('.modal-overlay').classList.remove('active')));
        const handleTipoClienteSelect = (e) => {
            orcamento.tipoCliente = e.target.dataset.tipo;
            document.getElementById('client-type-modal').classList.remove('active');
            startScreen.classList.add('hidden');
            mainContent.classList.remove('hidden');
            orcamentoModal.classList.add('active');
            document.getElementById('modal-step-1').classList.remove('hidden');
            document.getElementById('modal-step-2').classList.add('hidden');
        };
        document.getElementById('tipo-serralheiro-btn').addEventListener('click', handleTipoClienteSelect);
        document.getElementById('tipo-cliente-final-btn').addEventListener('click', handleTipoClienteSelect);

        clienteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            for (const key in clienteInputs) {
                if (clienteInputs[key]) {
                    orcamento.cliente[key] = clienteInputs[key].value;
                }
            }
            renderInfo();
            if (orcamento.itens.length === 0) {
                document.getElementById('modal-step-1').classList.add('hidden');
                document.getElementById('modal-step-2').classList.remove('hidden');
            } else {
                orcamentoModal.classList.remove('active');
            }
        });
        itemForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            let newItem;
            const descricao = itemDescInput.value;
            const isCalculable = calculableSlats.some(slatName => descricao.includes(slatName));
            if (isCalculable) {
                let alturaM = parseFloat(itemAltInput.value);
                const comprimentoM = parseFloat(itemCompInput.value);
                if (isNaN(alturaM) || alturaM <= 0 || isNaN(comprimentoM) || comprimentoM <= 0) {
                    alert('Para calcular, preencha a Altura e o Comprimento.');
                    return;
                }
                const areaTotalM2 = parseFloat(itemQtdInput.value);
                const precoPorM2 = parseCurrency(itemVlrInput.value);
                const comprimentoProducao = comprimentoM;
                const alturaProducao = incluirRoloCheck.checked ? alturaM + 0.60 : alturaM;
                const alturaLaminaCM = descricao.includes('SUPER CANA') ? 10 : 7.5;
                lastCalculatedDimensions = {
                    altura: alturaM,
                    comprimento: comprimentoM,
                    totalLaminas: Math.ceil((alturaProducao * 100) / alturaLaminaCM)
                };
                newItem = {
                    descricao: `Kit Lâminas "${descricao}" p/ vão de ${comprimentoM.toFixed(2)}m x ${alturaM.toFixed(2)}m ${incluirRoloCheck.checked ? '(+rolo)' : ''}`,
                    comp: comprimentoProducao.toFixed(2),
                    alt: alturaProducao.toFixed(2),
                    qtd: areaTotalM2,
                    unid: 'm²',
                    vlr: precoPorM2,
                    descPerc: 0
                };
            } else {
                newItem = {
                    descricao: descricao,
                    comp: parseFloat(itemCompInput.value) || 0,
                    alt: parseFloat(itemAltInput.value) || 0,
                    qtd: parseFloat(itemQtdInput.value) || 1,
                    unid: itemUnidInput.value,
                    vlr: parseCurrency(itemVlrInput.value) || 0,
                    descPerc: parseFloat(document.getElementById('item-desc-perc').value) || 0
                };
            }
            orcamento.itens.push(newItem);
            renderTable();
            itemForm.reset();
            incluirRoloCheck.checked = false;
            gerenciarEstadoFormularioItem(false);
            itemDescInput.focus();
        });
        editOrcamentoForm.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('orcamento-num-display').textContent = document.getElementById('orcamento-num-edit').value;
            document.getElementById('orcamento-data-display').textContent = document.getElementById('orcamento-data-edit').value;
            editOrcamentoModal.classList.remove('active');
        });

        document.getElementById('edit-cliente-btn').addEventListener('click', () => {
            for (const key in clienteInputs) {
                if (clienteInputs[key]) {
                    clienteInputs[key].value = orcamento.cliente[key] || '';
                }
            }
            formatarCPFCNPJ(clienteInputs.cnpj);
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
            itemForm.reset();
            incluirRoloCheck.checked = false;
            gerenciarEstadoFormularioItem(false);
            itemDescInput.focus();
        });
        voltarBtn.addEventListener('click', () => {
            document.getElementById('modal-step-2').classList.add('hidden');
            document.getElementById('modal-step-1').classList.remove('hidden');
        });

        // CORREÇÃO: Listener removido do kitSelect e adicionado ao botão btn-adicionar-kit
        btnAdicionarKit.addEventListener('click', adicionarKitAoOrcamento);

        itemAltInput.addEventListener('input', calcularEAtualizarCamposPorta);
        itemCompInput.addEventListener('input', calcularEAtualizarCamposPorta);
        incluirRoloCheck.addEventListener('change', calcularEAtualizarCamposPorta);
        document.getElementById('cliente-cnpj').addEventListener('input', (e) => formatarCPFCNPJ(e.target));
        document.getElementById('desconto-geral').addEventListener('input', recalcularTudo);
        freteTipoSelect.addEventListener('change', () => {
            freteValorRow.classList.toggle('hidden', freteTipoSelect.value !== 'Correio');
            if (freteTipoSelect.value !== 'Correio') freteValorInput.value = '0,00';
            recalcularTudo();
        });
        freteValorInput.addEventListener('input', recalcularTudo);

        tableBody.addEventListener('click', (e) => {
            if (e.target.closest('.remove-item')) {
                const index = e.target.closest('tr').dataset.index;
                orcamento.itens.splice(index, 1);
                renderTable();
            }
        });
        tableBody.addEventListener('input', (e) => {
            if (e.target.isContentEditable) {
                const row = e.target.closest('tr');
                const index = row.dataset.index;
                const field = e.target.dataset.field;
                let value = e.target.textContent;
                if (field === 'vlr') {
                    value = parseCurrency(value);
                } else if (field !== 'descricao' && field !== 'unid') {
                    value = parseFloat(value) || 0;
                }
                orcamento.itens[index][field] = value;
                const item = orcamento.itens[index];
                const isItemCalculable = item.unid === 'm²';
                if (isItemCalculable && (field === 'alt' || field === 'comp')) {
                    const novaArea = Math.floor(item.alt * item.comp);
                    orcamento.itens[index].qtd = novaArea;
                    row.querySelector('[data-field="qtd"]').textContent = novaArea;
                }
                const updatedItem = orcamento.itens[index];
                const newTotalItem = (updatedItem.qtd * updatedItem.vlr) * (1 - updatedItem.descPerc / 100);
                const totalCell = row.querySelector('td:nth-last-child(2)');
                totalCell.textContent = formatCurrency(newTotalItem);
                recalcularTudo();
            }
        });

        itemDescInput.addEventListener('input', () => {
            const query = itemDescInput.value.toLowerCase();
            // REMOVIDO: Filtro de kit não é mais usado aqui
            autocompleteList.innerHTML = '';
            let sourceProducts = produtosDB; // Sempre busca em todos os produtos
            if (!query) {
                autocompleteList.classList.add('hidden');
                return;
            }
            const filtered = sourceProducts.filter(p => p && p.toLowerCase().includes(query));

            if (filtered.length > 0) {
                autocompleteList.classList.remove('hidden');
                filtered.forEach(p => {
                    const li = document.createElement('li');
                    li.textContent = p;
                    li.addEventListener('click', async () => {
                        itemDescInput.value = p;
                        autocompleteList.classList.add('hidden');
                        const produtoInfo = await buscarPrecoProduto(p);
                        if (produtoInfo && produtoInfo.preco !== undefined) {
                            itemVlrInput.value = produtoInfo.preco.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2
                            });
                            itemUnidInput.value = produtoInfo.unidade || 'un';
                        } else {
                            itemVlrInput.value = '0,00';
                            itemUnidInput.value = 'un';
                        }
                        const pLower = p.toLowerCase();
                        if (pLower.includes('guia')) {
                            let qtdGuia = lastCalculatedDimensions.altura;
                            if (incluirRoloCheck.checked) qtdGuia += 0.10;
                            itemQtdInput.value = qtdGuia > 0 ? qtdGuia.toFixed(2) : 1;
                        } else if (pLower.includes('soleira')) {
                            itemQtdInput.value = lastCalculatedDimensions.comprimento > 0 ? lastCalculatedDimensions.comprimento.toFixed(2) : 1;
                        } else if (pLower.includes('trava')) {
                            itemQtdInput.value = lastCalculatedDimensions.totalLaminas > 0 ? Math.ceil(lastCalculatedDimensions.totalLaminas / 2) : 1;
                        }
                        const isCalculable = calculableSlats.some(slatName => p.includes(slatName));
                        gerenciarEstadoFormularioItem(isCalculable);
                        if (isCalculable) calcularEAtualizarCamposPorta();
                    });
                    autocompleteList.appendChild(li);
                });
            } else {
                autocompleteList.classList.add('hidden');
            }
        });
        document.addEventListener('click', (e) => {
            if (e.target.id !== 'item-desc') autocompleteList.classList.add('hidden');
        });
    }

    // =================================================================
    // 9. INICIALIZAÇÃO DA APLICAÇÃO
    // =================================================================
    async function init() {
        await carregarProdutos();
        popularEmpresasSelect();
        atualizarDadosEmpresa();
        popularKitsSelect();
        setupEventListeners();
    }

    init();
});