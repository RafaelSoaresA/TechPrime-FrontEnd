import * as myLocalStorage from './myLocalStorage.js';

const objUserAuth = JSON.parse(myLocalStorage.getItemWithExpiry('UserAuth'));


function converterStatus(codigo) {
    const statusMap = {
        'AP': 'Aguardando Pagamento',
        'PR': 'Pagamento Rejeitado',
        'PS': 'Pagamento com Sucesso',
        'AR': 'Aguardando Retirada',
        'TR': 'Em Trânsito',
        'EN': 'Entregue',
        'CN': 'Cancelado'
    };
    return statusMap[codigo] || 'Status Desconhecido';
}

function converterFormaPagamento(codigo) {
    const pagamentoMap = {
        'CC': 'Cartão de Crédito',
        'BL': 'Boleto'
    };
    return pagamentoMap[codigo] || 'Forma de Pagamento Desconhecida';
}

function converterTipoPessoa(codigo) {
    const tipoMap = {
        'F': 'Fisico',
        'J': 'Juridico'
    };
    return tipoMap[codigo] || 'Tipo Desconhecido';
}

function converterTipoEntrega(codigo) {
    const entregaMap = {
        'TE': 'Total Express',
        'SE': 'Sedex',
        'CO': 'Correios'
    };
    return entregaMap[codigo] || 'Tipo de Entrega Desconhecido';
}

function formatarData(dataJson) {
    const data = new Date(dataJson);

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0'); // Os meses começam em 0
    const ano = data.getFullYear();

    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    const segundos = String(data.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
}

function onLoad () {

    document.getElementById('navmenuAdmin').style.display = 'none';
    document.getElementById('navmenuStocker').style.display = 'none';
    document.getElementById('navmenuCustomer').style.display = 'none';
    document.getElementById('iconListaPedidos').style.display = 'none';
    document.getElementById('iconCart').style.display = 'none';
    document.getElementById('lblMeusPedidos').innerHTML = "Administração de <span>Pedidos</span>";
    document.title= "Administração de Pedidos";
    

    if (objUserAuth && objUserAuth.role === "admin") {
        document.getElementById('navmenuAdmin').style.display = '';
        LoadAllOrders();
    } else if (objUserAuth && objUserAuth.role === "stocker") {
        document.getElementById('navmenuStocker').style.display = '';
        LoadAllOrders();
    } else if (objUserAuth && objUserAuth.role === "customer") {
        document.getElementById('navmenuCustomer').style.display = '';
        document.getElementById('iconListaPedidos').style.display = '';
        document.getElementById('iconCart').style.display = '';
        document.getElementById('lblMeusPedidos').innerHTML = "Meus <span>Pedidos</span>";
        document.title = "Meus Pedidos";
        LoadCustomerOrders();
    } else {
        window.location.href = 'login.html';
    }

}


function LoadPedidos(data) {

    function exibirDetalhes(item) {
        //alert(`ID: ${item.id}\nCusto Total: ${item.totalCost}\nCusto de Envio: ${item.shippingCost}\nStatus da Fatura: ${item.invoiceStatus}\nData de Criação: ${item.createdAt}\nForma de Pagamento: ${item.paymentType}`);
        // Aqui você pode adicionar a lógica para mostrar os detalhes em uma nova página ou modal
        console.log(item);
        window.location.href = 'shop-detalhe-pedido.html?orderNumber='+item.id;
    }

    const tableBody = document.getElementById('orderTable').getElementsByTagName('tbody')[0];

    data.forEach(item => {
        const row = tableBody.insertRow();

        const cell1 = row.insertCell(0);
        const cell2 = row.insertCell(1);
        const cell3 = row.insertCell(2);
        const cell4 = row.insertCell(3);
        const cell5 = row.insertCell(4);
        const cell6 = row.insertCell(5);
        const cell7 = row.insertCell(6);

        cell1.textContent = item.id;
        cell2.textContent = item.totalCost.toFixed(2);
        cell3.textContent = item.shippingCost.toFixed(2)
        cell4.textContent = converterStatus(item.invoiceStatus);
        cell5.textContent = formatarData(item.createdAt);
        cell6.textContent = converterFormaPagamento(item.paymentType);

        const detalheButton = document.createElement('button');
        if (objUserAuth && objUserAuth.role === "admin") {
            detalheButton.textContent = "Editar";
        } else if (objUserAuth && objUserAuth.role === "stocker") {
            detalheButton.textContent = "Editar";
        } else if (objUserAuth && objUserAuth.role === "customer") {
            detalheButton.textContent = "Ver Detalhes";
        }

        
        detalheButton.addEventListener('click', () => {
            exibirDetalhes(item);
        });
        cell7.appendChild(detalheButton);
    });

    function formatarData(dataJson) {
        const data = new Date(dataJson);

        const dia = String(data.getDate()).padStart(2, '0');
        const mes = String(data.getMonth() + 1).padStart(2, '0'); // Os meses começam em 0
        const ano = data.getFullYear();

        const horas = String(data.getHours()).padStart(2, '0');
        const minutos = String(data.getMinutes()).padStart(2, '0');
        const segundos = String(data.getSeconds()).padStart(2, '0');

        return `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;
    }
}


function LoadAllOrders() {

    fetch(`http://localhost:8080/shop/allOrders`, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${objUserAuth.token}`, 
            'Content-Type': 'application/json',
        },
    })
    
    .then(response => {
        // Diferente 200
        if (!response.ok) {
            msgError();
            exit;
        }
        // Extraia o JSON da resposta
        return response.json();
    })
    
    
    .then(jsonData => {
        console.log(jsonData);
        LoadPedidos(jsonData);

    })
    
    .catch(error => {
        console.error('Erro ao criar usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    }); 

}


function LoadCustomerOrders() {

    fetch(`http://localhost:8080/shop/customerOrders`, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${objUserAuth.token}`, 
            'Content-Type': 'application/json',
        },
    })
    
    .then(response => {
        // Diferente 200
        if (!response.ok) {
            msgError();
            exit;
        }
        // Extraia o JSON da resposta
        return response.json();
    })
    
    
    .then(jsonData => {
        console.log(jsonData);
        LoadPedidos(jsonData);

    })
    
    .catch(error => {
        console.error('Erro ao criar usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    }); 

}



function msgError(){
    Swal.fire({
      title: "Alteração inválida!",
      text: "Acesso não permitido",
      icon: "error"
    });
}

export function IrHome() { 
    const objUserAuth = JSON.parse(myLocalStorage.getItemWithExpiry('UserAuth'));

    if (objUserAuth) {
        if (objUserAuth && objUserAuth.role === "admin") {
            window.location.href = 'admin/updateUser.html';
        } else if (objUserAuth && objUserAuth.role === "stocker") {
            window.location.href = 'stocker/updateUser-stocker.html';
        } else if (objUserAuth && objUserAuth.role === "customer") {
            window.location.href = 'customer/profile.html';
        } else {
            window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }

}

export function filterTable() {
    var input = document.getElementById('searchInput');
    var filter = input.value.toLowerCase();
    var tableBody = document.getElementById('orderTable');
    var rows = tableBody.getElementsByTagName('tr');

    
    for (var i = 0; i < rows.length; i++) {
        var productNameCell = rows[i].getElementsByTagName('td')[0];
        if (productNameCell) {
            var productNameCell = productNameCell.textContent || productNameCell.innerText;
            if (productNameCell.toLowerCase().indexOf(filter) > -1) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none"; 
            }
        }
    }
}

window.filterTable = filterTable;


window.IrHome = IrHome;
window.onload = onLoad;

