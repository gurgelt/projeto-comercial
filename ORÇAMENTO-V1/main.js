document.addEventListener('DOMContentLoaded', () => {

            // --- Estado da Aplicação ---
            const orcamento = {
                cliente: {},
                itens: [],
                descontoGeral: 0,
            };

            const produtosDB = [
                '1/2 Cana Galvanizada', 'Automatizador', 'Chapa Testeira', 
                'Soleira', 'Guia de 70', 'Kit controle Atron'
            ];

            // --- Seletores de Elementos ---
            const startScreen = document.getElementById('start-screen');
            const mainContent = document.getElementById('main-content');
            const modal = document.getElementById('orcamento-modal');
            const showModalBtn = document.getElementById('show-modal-btn');
            const closeButtons = document.querySelectorAll('.close-modal');
            const modalStep1 = document.getElementById('modal-step-1');
            const modalStep2 = document.getElementById('modal-step-2');
            const clienteForm = document.getElementById('cliente-form');
            const itemForm = document.getElementById('item-form');
            const voltarBtn = document.getElementById('voltar-btn');
            
            // --- Funções de Formatação ---
            const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
            const parseCurrency = (value) => {
                if (typeof value === 'number') return value;
                return Number(String(value).replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
            };

            // --- Funções do Modal ---
            const showModal = () => modal.classList.add('active');
            const hideModal = () => {
                modal.classList.remove('active');
                // Reseta o modal para a primeira etapa
                modalStep1.classList.remove('hidden');
                modalStep2.classList.add('hidden');
            };

            // --- Funções de Renderização ---
            const renderInfo = () => {
                document.getElementById('cliente-nome-display').textContent = orcamento.cliente.nome;
                document.getElementById('cliente-cnpj-display').textContent = orcamento.cliente.cnpj;
                document.getElementById('orcamento-num-display').textContent = Math.floor(1000 + Math.random() * 9000);
                document.getElementById('orcamento-data-display').textContent = new Date().toLocaleDateString('pt-BR');
            };

            const renderTable = () => {
                const tableBody = document.getElementById('orcamento-table-body');
                tableBody.innerHTML = '';
                orcamento.itens.forEach((item, index) => {
                    const totalItem = (item.qtd * item.vlr) * (1 - item.desc / 100);
                    const row = document.createElement('tr');
                    row.dataset.index = index;
                    row.innerHTML = `
                        <td>${String(index + 1).padStart(3, '0')}</td>
                        <td contenteditable="true" data-field="desc">${item.desc}</td>
                        <td contenteditable="true" data-field="comp">${item.comp}</td>
                        <td contenteditable="true" data-field="alt">${item.alt}</td>
                        <td contenteditable="true" data-field="qtd">${item.qtd}</td>
                        <td contenteditable="true" data-field="unid">${item.unid}</td>
                        <td contenteditable="true" data-field="vlr" class="currency">${item.vlr.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                        <td contenteditable="true" data-field="desc" class="percentage">${item.desc}</td>
                        <td>${formatCurrency(totalItem)}</td>
                        <td class="no-print actions-cell">
                            <button class="remove-item" style="background:none; border:none; cursor:pointer; color: #ef4444;">&times;</button>
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
                    subtotal += (item.qtd * item.vlr) * (1 - item.desc / 100);
                });
                
                orcamento.descontoGeral = parseFloat(document.getElementById('desconto-geral').value) || 0;
                const totalGeral = subtotal * (1 - orcamento.descontoGeral / 100);

                document.getElementById('subtotal').textContent = formatCurrency(subtotal);
                document.getElementById('total-geral').textContent = formatCurrency(totalGeral);
            };

            // --- Event Listeners ---
            showModalBtn.addEventListener('click', () => {
                startScreen.classList.add('hidden');
                mainContent.classList.remove('hidden');
                showModal();
            });
            
            closeButtons.forEach(btn => btn.addEventListener('click', hideModal));
            
            clienteForm.addEventListener('submit', (e) => {
                e.preventDefault();
                orcamento.cliente.nome = document.getElementById('cliente-nome').value;
                orcamento.cliente.cnpj = document.getElementById('cliente-cnpj').value;
                renderInfo();
                modalStep1.classList.add('hidden');
                modalStep2.classList.remove('hidden');
            });

            voltarBtn.addEventListener('click', () => {
                modalStep2.classList.add('hidden');
                modalStep1.classList.remove('hidden');
            });
            
            itemForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newItem = {
                    desc: document.getElementById('item-desc').value,
                    comp: parseFloat(document.getElementById('item-comp').value) || 0,
                    alt: parseFloat(document.getElementById('item-alt').value) || 0,
                    qtd: parseFloat(document.getElementById('item-qtd').value) || 1,
                    unid: document.getElementById('item-unid').value,
                    vlr: parseCurrency(document.getElementById('item-vlr').value) || 0,
                    desc: parseFloat(document.getElementById('item-desc-perc').value) || 0
                };
                orcamento.itens.push(newItem);
                renderTable();
                itemForm.reset();
                document.getElementById('item-desc').focus();
            });
            
            // Listener para edição inline
            document.getElementById('orcamento-table-body').addEventListener('input', (e) => {
                if (e.target.isContentEditable) {
                    const index = e.target.parentElement.dataset.index;
                    const field = e.target.dataset.field;
                    let value = e.target.textContent;

                    if (field === 'vlr') {
                        value = parseCurrency(value);
                    } else if (field !== 'desc' && field !== 'unid') {
                        value = parseFloat(value) || 0;
                    }
                    
                    orcamento.itens[index][field] = value;
                    // Não renderiza a tabela inteira, só recalcula para performance
                    recalcularTudo();
                }
            });

            document.getElementById('orcamento-table-body').addEventListener('click', (e) => {
                if(e.target.classList.contains('remove-item')) {
                    const index = e.target.closest('tr').dataset.index;
                    orcamento.itens.splice(index, 1);
                    renderTable();
                }
            });
            
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
                        li.addEventListener('click', () => {
                            itemDescInput.value = p;
                            autocompleteList.classList.add('hidden');
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