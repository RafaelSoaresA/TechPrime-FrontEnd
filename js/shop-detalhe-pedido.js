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

    document.getElementById('orderUpdateTable').style.display = 'none'; // Esconde a tabela
    document.getElementById('navmenuAdmin').style.display = 'none';
    document.getElementById('navmenuStocker').style.display = 'none';
    document.getElementById('navmenuCustomer').style.display = 'none';
    document.getElementById('iconListaPedidos').style.display = 'none';
    document.getElementById('iconCart').style.display = 'none';


    if (objUserAuth && objUserAuth.role === "admin") {
        document.getElementById('orderUpdateTable').style.display = '';
        document.getElementById('navmenuAdmin').style.display = '';
    } else if (objUserAuth && objUserAuth.role === "stocker") {
        document.getElementById('orderUpdateTable').style.display = '';
        document.getElementById('navmenuStocker').style.display = '';
    } else if (objUserAuth && objUserAuth.role === "customer") {
        document.getElementById('navmenuCustomer').style.display = '';
        document.getElementById('iconListaPedidos').style.display = '';
        document.getElementById('iconCart').style.display = '';
    } else {
        window.location.href = 'login.html';
    }
    
    LoadDadosPedido();
}

function loadCustomer(userData){

    function populateTable(data) {
        const dataCell = document.querySelector('.user-data-cell');
        dataCell.className = 'endereco-estrutura';
        dataCell.textContent = 
        `
        Email: ${data.user.email}
        Nome Completo: ${data.fullname}
        Documento: ${data.document}
        Tipo de Cliente: ${converterTipoPessoa(data.customerType)}
        Data de Nascimento: ${data.birthDate}
        Telefone 1: ${data.phone1}
        Telefone 2: ${data.phone2 || 'N/A'}`;
    }

    populateTable(userData);

}

function loadBillingAddress(billingAddress) {

    function populateTable(data) {
        const dataCell = document.querySelector('.address-data-cell');
        dataCell.className = 'endereco-estrutura';
        dataCell.textContent = `
        Apelido: ${data.nickname}
        CEP: ${data.zipCode}
        Tipo de Endereço: ${data.addressType}
        Endereço: ${data.address}
        Número: ${data.number}
        Complemento: ${data.complement || 'N/A'}
        Bairro: ${data.neighborhood}
        Cidade: ${data.city}
        Estado: ${data.state}`;
    }

    populateTable(billingAddress);
}

function loadDeliveredAddress(deliveryAddress) {

    function populateTable(data) {
        const dataCell = document.querySelector('.address-data-cell');
        dataCell.className = 'endereco-estrutura';
        dataCell.textContent = `
            Apelido: ${data.nickname}
            CEP: ${data.zipCode}
            Tipo de Endereço: ${data.addressType}
            Endereço: ${data.address}
            Número: ${data.number}
            Complemento: ${data.complement || 'N/A'}
            Bairro: ${data.neighborhood}
            Cidade: ${data.city}
            Estado: ${data.state}`;
    }

    populateTable(deliveryAddress);
}


function createOrderSummaryTable(data) {
    const tableBody = document.querySelector('#orderSummaryTable tbody');
    tableBody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        
        const imgCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = item.product.url_image;
        img.alt = item.product.name;
        img.width = 75;
        img.height = 75;
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = item.productName;
        row.appendChild(nameCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = item.product.description;
        row.appendChild(descriptionCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = `R$ ${item.product.price.toFixed(2)}`;
        row.appendChild(priceCell);

        const quantityCell = document.createElement('td');
        quantityCell.textContent = item.quantity;
        row.appendChild(quantityCell);

        tableBody.appendChild(row);
    });
}

function loadHistoryOrder(orderHistory){

    function populateTable(data) {
        const tableBody = document.querySelector('#orderHistoryTable tbody');
        tableBody.innerHTML = '';

        data.forEach(item => {
            const row = document.createElement('tr');
            
            const idCell = document.createElement('td');
            idCell.textContent = item.id;
            row.appendChild(idCell);

            const createdAtCell = document.createElement('td');
            createdAtCell.textContent = formatarData(item.createdAt);
            row.appendChild(createdAtCell);

            const emailCell = document.createElement('td');
            emailCell.textContent = item.user.email;
            row.appendChild(emailCell);

            const beforeStatusCell = document.createElement('td');
            beforeStatusCell.textContent = converterStatus(item.beforeInvoiceStatus);
            row.appendChild(beforeStatusCell);

            const actualStatusCell = document.createElement('td');
            actualStatusCell.textContent = converterStatus(item.actualInvoiceStatus);
            row.appendChild(actualStatusCell);

            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = item.description;
            row.appendChild(descriptionCell);

            tableBody.appendChild(row);
        });
    }

    populateTable(orderHistory);
}

function loadDadosGeraisPedido(orderData) {

    document.getElementById('status').value = orderData.invoiceStatus;
    document.getElementById('invoiceNumber').value = orderData.invoiceNumber;
    

    function populateTable(data) {
        const dataCell = document.querySelector('#orderDataTable .order-data-cell');
        dataCell.className = 'endereco-estrutura';
        dataCell.textContent = `
            Número do Pedido: ${data.id}
            Número da Nota Fiscal: ${data.invoiceNumber}
            Documento: ${data.document}
            Tipo de Cliente: ${converterTipoPessoa(data.customerType)}
            Nome Completo: ${data.fullname}
            Valor Total: R$ ${data.totalCost.toFixed(2)}
            Valor do Frete: R$ ${data.shippingCost.toFixed(2)}
            Status do Pedido: ${converterStatus(data.invoiceStatus)}
            Data de Criação: ${formatarData(data.createdAt)}
            Data de Alteração: ${formatarData(data.issueDate)}
            Tipo de Pagamento: ${converterFormaPagamento(data.paymentType)}
            Número de Parcelas: ${data.installmentsNumber}
            Tipo de Entrega: ${converterTipoEntrega(data.shippingType)}`;
    }

    populateTable(orderData);
}

function LoadDadosPedido() {
    const url = new URL(window.location.href);
    const orderNumber = url.searchParams.get('orderNumber');
    const NovoPedido = url.searchParams.get('NovoPedido');

    //const labelTotalPrice = document.getElementById('totalPrice');
    //labelTotalPrice.innerText = `R$ ${order.totalPrice.toFixed(2)}`;

    //http://localhost:8080/shop/order/11
    fetch(`http://localhost:8080/shop/order/${orderNumber}`, {
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
        }
        // Extraia o JSON da resposta
        return response.json();
    })
    
    
    .then(jsonData => {
        console.log(jsonData);
        loadDadosGeraisPedido(jsonData);
        loadCustomer(jsonData.customer);
        loadBillingAddress(jsonData.billingAddress);
        loadDeliveredAddress(jsonData.deliveryAddress);
    })
    
    .catch(error => {
        console.error('Erro ao criar usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    });   

    //http://localhost:8080/shop/order/11/history

 
    fetch(`http://localhost:8080/shop/order/${orderNumber}/history`, {
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
        }
        // Extraia o JSON da resposta
        return response.json();
    })
    
    
    .then(jsonData => {
        console.log(jsonData);
        loadHistoryOrder(jsonData);

    })
    
    .catch(error => {
        console.error('Erro ao criar usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    });   
    //http://localhost:8080/shop/order/11/details

    fetch(`http://localhost:8080/shop/order/${orderNumber}/details`, {
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
        }
        // Extraia o JSON da resposta
        return response.json();
    })
    
    
    .then(jsonData => {
        console.log(jsonData);
        createOrderSummaryTable(jsonData);
    })
    
    .catch(error => {
        console.error('Erro ao criar usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    });   

    if (NovoPedido==='S') {
        const labelNovoPedido= document.getElementById('NovoPedido');
        labelNovoPedido.innerText = `
                                    Obrigado pelo pedido! 
                                    
                                    `;
    } else {
        labelNovoPedido.innerText = '';
    }

    
}

document.getElementById('executeUpdateButton').addEventListener('click', function() {
    const status = document.getElementById('status').value;
    const invoiceNumber = document.getElementById('invoiceNumber').value;
    const observations = document.getElementById('observations').value;

    console.log('Status:', status);
    console.log('Número da Nota Fiscal:', invoiceNumber);
    console.log('Observações:', observations);

    // http://localhost:8080/shop/order/update

    const url = new URL(window.location.href);
    const orderNumber = parseInt(url.searchParams.get('orderNumber'));
    let jsonUpdate = {
        "invoiceId": orderNumber,
        "newStatus": status,
        "description": observations,
        "invoiceNumber": invoiceNumber
    }

    fetch('http://localhost:8080/shop/order/update', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${objUserAuth.token}`, 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonUpdate),
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


    .then(data => {
        //Gravar forma de pagamento na order
        console.log(data);
        msgStatusAtualizado(orderNumber);
        
    })

    .catch(error => {
        console.error('Erro ao criar usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    });



});

function msgStatusAtualizado(orderNumber){
    
    Swal.fire({
        title: "Pedido atualizado com sucesso!",
        text: `Número do pedido: ${orderNumber}`,
        icon: "success",
        confirmButtonText: "OK"
    }).then((result) => {
        if (result.isConfirmed) {
            // Redireciona para a página desejada
            window.location.reload();
        }
    });
}

function msgError(){
    Swal.fire({
      text: "Ocorreu um erro inesperado!",
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

window.IrHome = IrHome;
window.onload = onLoad;

