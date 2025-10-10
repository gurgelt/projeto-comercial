document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // 1. ESTADO DA APLICAÇÃO E DADOS GLOBAIS
    // =================================================================
    const orcamento = { cliente: {}, tipoCliente: null, itens: [] };
    let produtosDB = [];
    const calculableSlats = [
        '(ID 1) 1/2 CANA GALVANIZADA (FECHADA)',
        '(ID 2) 1/2 CANA TRANSVISION (FURADA)',
        '(ID 66) SUPER CANA'
    ];
    const empresasDB = [
        { id: 1, displayName: 'Atrox - SP', name: 'Atrox', address: 'Rua Mafra 375, Ipiranga - São Paulo/SP' },
        { id: 2, displayName: 'Atrox - MG', name: 'Atrox', address: 'Rua Presidente Getúlio Vargas 3765 - Itapeva/MG' },
        { id: 3, displayName: 'Atron - SP', name: 'Atron', address: 'Rua Mafra 375, Ipiranga - São Paulo/SP' },
        { id: 4, displayName: 'Atron - MG', name: 'Atron', address: 'Rua Presidente Getúlio Vargas 3765 - Itapeva/MG' }
    ];

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
        if (!orcamento.tipoCliente) {
            alert("Erro: Tipo de cliente não definido.");
            return 0;
        }
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
    // 4. FUNÇÕES AUXILIARES
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
        const isCalculable = calculableSlats.some(slatName => descricao.includes(slatName.substring(7)));
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
        const larguraFinal = comprimentoM + 0.10;
        const areaTotalM2 = alturaFinal * larguraFinal;
        const areaInteira = Math.floor(areaTotalM2);
        itemQtdInput.value = areaInteira;
        itemUnidInput.value = 'm²';
    }

    // =================================================================
    // 6. FUNÇÕES DE RENDERIZAÇÃO E CÁLCULO GERAL
    // =================================================================
    const renderInfo = () => { /* ... (sem alterações) ... */ };
    const renderTable = () => { /* ... (sem alterações) ... */ };
    const recalcularTudo = () => { /* ... (sem alterações) ... */ };

    // =================================================================
    // 7. FUNÇÕES DE GERENCIAMENTO DA EMPRESA
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

        itemForm.addEventListener('submit', async (e) => { /* ... (sem alterações) ... */ });
        editOrcamentoForm.addEventListener('submit', (e) => { /* ... (sem alterações) ... */ });
        document.getElementById('edit-cliente-btn').addEventListener('click', () => { /* ... (sem alterações) ... */ });
        document.getElementById('edit-orcamento-btn').addEventListener('click', () => { /* ... (sem alterações) ... */ });
        document.getElementById('add-item-btn').addEventListener('click', () => { /* ... (sem alterações) ... */ });
        voltarBtn.addEventListener('click', () => { /* ... (sem alterações) ... */ });
        itemAltInput.addEventListener('input', calcularEAtualizarCamposPorta);
        itemCompInput.addEventListener('input', calcularEAtualizarCamposPorta);
        incluirRoloCheck.addEventListener('change', calcularEAtualizarCamposPorta);
        document.getElementById('cliente-cnpj').addEventListener('input', (e) => formatarCPFCNPJ(e.target));
        document.getElementById('desconto-geral').addEventListener('input', recalcularTudo);
        freteTipoSelect.addEventListener('change', () => { /* ... (sem alterações) ... */ });
        freteValorInput.addEventListener('input', recalcularTudo);
        tableBody.addEventListener('click', (e) => { /* ... (sem alterações) ... */ });
        tableBody.addEventListener('input', (e) => { /* ... (sem alterações) ... */ });
        itemDescInput.addEventListener('input', () => { /* ... (sem alterações) ... */ });
        document.addEventListener('click', (e) => { if (e.target.id !== 'item-desc') autocompleteList.classList.add('hidden'); });
    }

    // =================================================================
    // 9. INICIALIZAÇÃO DA APLICAÇÃO
    // =================================================================
    function init() {
        carregarProdutos();
        popularEmpresasSelect();
        atualizarDadosEmpresa();
        setupEventListeners();
    }

    init();
});