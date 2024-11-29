import * as myLocalStorage from './myLocalStorage.js';

const objUserAuth = JSON.parse(myLocalStorage.getItemWithExpiry('UserAuth'));
const order = JSON.parse(localStorage.getItem('order'));
let selectedPaymentType = null;
let tokenCC = null;
let installmentsNumber = 1;

function converterGenero(codigo) {
    const tipoMap = {
        'M': 'Masculino',
        'F': 'Feminino',
        'N': 'Prefiro não informar'
    };
    return tipoMap[codigo] || 'Tipo Desconhecido';
}

function maskCreditCard(cardNumber) {
    // Verifica se o número do cartão tem 16 caracteres
    if (cardNumber.length === 16) {
        // Retorna o número mascarado com apenas os últimos 4 dígitos visíveis
        return '************' + cardNumber.slice(-4);
    } else {
        throw new Error("Número de cartão inválido. Deve conter 16 dígitos.");
    }
}

function onLoad () {
    console.log(order);   
    document.getElementById("deliveryAddressTableOrder").style.display = "none";
    document.getElementById("billingAddressTableOrder").style.display = "none";
    document.getElementById("DetalheResumoPedido").style.display = "none";
    document.getElementById("back-btn").style.display = "none";
    loadCustomerData();
    loadCustomerAddress();
    createOrderSummaryTable(order.products);
    const labelTotalPrice = document.getElementById('totalPrice');
    labelTotalPrice.innerText = `R$ ${order.totalPrice.toFixed(2)}`;

    const checkbox = document.getElementById('updateAddressCheckbox');
    const formRow = document.getElementById('formRow');
    
    checkbox.addEventListener('change', function() {
   
        if (checkbox.checked) {
            formRow.style.display = 'table-row'; // Exibe a linha do formulário
        } else {
            formRow.style.display = 'none'; // Esconde a linha do formulário
        }
    });


    const checkboxDelivery = document.getElementById('createDeliveryAddressCheckbox');
    const formRowDelivery = document.getElementById('formRowDelivery');
    
    checkboxDelivery.addEventListener('change', function() {
        if (checkboxDelivery.checked) {
            formRowDelivery.style.display = 'table-row'; // Exibe a linha do formulário
            const checkboxes = document.querySelectorAll('input[name="selectionAddress"]'); //document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = false;
                cb.disabled = true;
            });
        } else {
            formRowDelivery.style.display = 'none'; // Esconde a linha do formulário
            const checkboxes = document.querySelectorAll('input[name="selectionAddress"]'); //document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = false;
                cb.disabled = false;
            });
        }
    });

}

export function IrHome() { 
    
    if (objUserAuth) {
        window.location.href = 'customer/profile.html';
    } else {
        window.location.href = 'login.html';
    }

}

function loadCustomerData(){
    fetch('http://localhost:8080/customer/user', {
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

       const table = document.getElementById('userTable').getElementsByTagName('tbody')[0];

       for (const key in jsonData) {
            if (typeof jsonData[key] === 'object') {
                for (const subKey in jsonData[key]) {
                    addRow(table, `${key}.${subKey}`, jsonData[key][subKey]);
                }
            } else {
                addRow(table, key, jsonData[key]);
            }   
       }

    })
    
    .catch(error => {
        console.error('Erro ao criar usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    });   

    function addRow(table, key, value) {
        if (CampoHabilitado(key)){
            const row = table.insertRow();
            const cellKey = row.insertCell(0);
            const cellValue = row.insertCell(1);
            cellKey.textContent = buscaNomeCampo(key);
            if (key==="gender") {
                value = converterGenero(value);
            }
            cellValue.textContent = value;
        }
    }

    function CampoHabilitado(valor) {
        const array = ['user.email', 'fullname', 'document', 'birthDate', 'phone1', 'phone2', 'customerType', 'gender'];
        return array.includes(valor);
    }

    function buscaNomeCampo(valor) {
        const array = [
            { coluna1: 'user.email', coluna2: 'E-mail' },
            { coluna1: 'fullname', coluna2: 'Nome Completo' },
            { coluna1: 'document', coluna2: 'Documento' },
            { coluna1: 'birthDate', coluna2: 'Data de Aniversário' },
            { coluna1: 'phone1', coluna2: 'Telefone 1' },
            { coluna1: 'phone2', coluna2: 'Telefone 2' },
            { coluna1: 'customerType', coluna2: 'Tipo de Pessoa' },
            { coluna1: 'gender', coluna2: 'Gênero' },
        ];
        for (let i = 0; i < array.length; i++) {
            if (array[i].coluna1 === valor) {
                // Retorna o valor da segunda coluna
                return array[i].coluna2;
            }
        }
        // Retorna null se o valor não for encontrado
        return null;
    } 

}


function loadCustomerAddress () {
    fetch('http://localhost:8080/customer/customerAddress', {
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

       const deliveryTable = document.getElementById('deliveryTable').getElementsByTagName('tbody')[0];
       const billingTable = document.getElementById('billingTable').getElementsByTagName('tbody')[0];
       jsonData.forEach(item => addRow(deliveryTable, billingTable, item));
  
    })

    let selectedRecord = null;

    function addRow(table, billingTable, item) {
        
        console.log(item);
        if (item.customerAddressType === 'B') {
            addRowBilling(billingTable, item);
            return;
        }
        
        const row = table.insertRow();
        const selectCell = row.insertCell();
        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.name = 'selectionAddress';
        checkBox.addEventListener('change', () => {
            // Desmarca todas as outras caixas de seleção
            const checkboxes = document.querySelectorAll('input[name="selectionAddress"]'); //document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                if (cb !== checkBox) cb.checked = false;
            });

            // Atualiza a variável de registro selecionado
            if (checkBox.checked) {
                selectedRecord = item;
            } else {
                selectedRecord = null;
            }
            console.log(selectedRecord);
            order.deliveryAddressDto = selectedRecord;
            console.log(order);
        });
        selectCell.appendChild(checkBox);

        const dataCell = row.insertCell();
        dataCell.className = 'endereco-estrutura';
        dataCell.textContent = `
            Apelido: ${item.nickname}
            CEP: ${item.zipCode}
            Tipo de Endereço: ${item.addressType}
            Endereço: ${item.address}
            Número: ${item.number}
            Complemento: ${item.complement || 'N/A'}
            Bairro: ${item.neighborhood}
            Cidade: ${item.city}
            Estado: ${item.state}
        `;
    }

    function addRowBilling(table, item) {
        order.billingAddressDto = item;
        const row = table.insertRow();
  
        const dataCell = row.insertCell();
        dataCell.className = 'endereco-estrutura';
        dataCell.textContent = `
            Apelido: ${item.nickname}
            CEP: ${item.zipCode}
            Tipo de Endereço: ${item.addressType}
            Endereço: ${item.address}
            Número: ${item.number}
            Complemento: ${item.complement || 'N/A'}
            Bairro: ${item.neighborhood}
            Cidade: ${item.city}
            Estado: ${item.state}
        `;
    }


}  

function handleSelection(selectedCheckbox, paymentType) {
    const checkboxes = document.querySelectorAll('input[name="selection"]');
    checkboxes.forEach(checkbox => {
        if (checkbox !== selectedCheckbox) {
            checkbox.checked = false;
        }
    });

    if (selectedCheckbox.checked) {
        selectedPaymentType = paymentType;
        if (paymentType === 'CC') {
            enableCreditCardDetails(true);
        } else {
            enableCreditCardDetails(false);
        }
    } else {
        selectedPaymentType = null;
        enableCreditCardDetails(false);
    }
    console.log('Tipo de Pagamento Selecionado:', selectedPaymentType);
}
//parte rafael

function enableCreditCardDetails(enable) {
    const creditCardDetailsRow = document.getElementById('creditCardDetails');
    const inputs = creditCardDetailsRow.querySelectorAll('input');
    if (enable) {
        creditCardDetailsRow.classList.remove('disabled');
        inputs.forEach(input => input.disabled = false);
    } else {
        creditCardDetailsRow.classList.add('disabled');
        inputs.forEach(input => input.disabled = true);
    }
}

function createOrderSummaryTable(data) {
    const tableBody = document.querySelector('#orderSummaryTable tbody');
    tableBody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        
        const imgCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = item.url_image;
        img.alt = item.name;
        img.width = 75;
        img.height = 75;
        imgCell.appendChild(img);
        row.appendChild(imgCell);

        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        row.appendChild(nameCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = item.description;
        row.appendChild(descriptionCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = `R$ ${item.price.toFixed(2)}`;
        row.appendChild(priceCell);

        const quantityCell = document.createElement('td');
        quantityCell.textContent = item.quantity;
        row.appendChild(quantityCell);

        tableBody.appendChild(row);
    });
}

document.getElementById('checkout-btn').addEventListener('click', function() {
    event.preventDefault();

    //VALIDACAO DE FORMULARIOS
    const checkboxBilling = document.getElementById('updateAddressCheckbox');
    const checkboxDelivery = document.getElementById('createDeliveryAddressCheckbox');

    if (this.innerText === "Finalizar Compra") {
        console.log("Finalizar Compra");
        if (checkboxDelivery.checked) {
            persistDeliveryAddress();
        } else {
            enviarPedido();
        }       
    }
   
    //VALIDACAO DE ENDERECO DE COBRANCA
    if (checkboxBilling.checked) {
        const frmBillingAddress = document.getElementById('frmBillingAddress');
        if (!frmBillingAddress.reportValidity()) {
            msgErrorValidation();
            console.log("Formulário inválido!");
            return;
        }
    } 

    //VALIDACAO DE ENDERECO DE ENTREGA
    if (checkboxDelivery.checked) {
        const frmDeliveryAddress = document.getElementById('frmDeliveryAddress');
        if (!frmDeliveryAddress.reportValidity()) {
            msgErrorValidation();
            console.log("Formulário inválido!");
            return;
        }
    } else {
        const chksselectionAddress = document.querySelectorAll('input[name="selectionAddress"]'); 
        let algumSelecionado = false;

        Array.from(chksselectionAddress).forEach(checkbox => {
            if (checkbox.checked) {
                algumSelecionado = true;
            }
        });

        if (!algumSelecionado) {
            msgErrorValidationDelivery();
            return;
        }
        

    }
    
    //VALIDACAO DE FORMA DE PAGAMENTO
    if(selectedPaymentType === null){
        console.log("Formulário inválido!");
        msgErrorValidationFormaPagamento();
        return;
    }
    
    //VALIDACAO DE CARTAO DE CREDITO
    if(selectedPaymentType === 'CC'){
        const frmCreditCard = document.getElementById('frmCreditCard');
        if (!frmCreditCard.reportValidity()) {
            msgErrorValidation();
            console.log("Formulário inválido!");
            return;
        }    
    }
   
    //GRAVACAO
    if (checkboxBilling.checked) {
        updateBillingAddress();
    } else {
        if (checkboxDelivery.checked) {
            createDeliveryAddress();
        } else {
            createCreditCard();
        }
    }

    //Parte rafael
    //endereco de faturamento
    function updateBillingAddress() {
        const billingAddressData = JSON.stringify({
            zipCode: document.getElementById('zipCode').value,
            addressType: document.getElementById('addressType').value,
            address: document.getElementById('address').value,
            number: document.getElementById('number').value,
            complement: document.getElementById('complement').value,
            neighborhood: document.getElementById('neighborhood').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
        });

        console.log(billingAddressData);
        console.log(objUserAuth.token);
    
        fetch('http://localhost:8080/customer/billingAddress/update', {
            method: 'PUT',
            headers: {
                'Authorization': `Basic ${objUserAuth.token}`, 
                'Content-Type': 'application/json',
            },
            body: billingAddressData,
        })
    
        .then(response => {
            // Diferente 200
            if (!response.ok) {
                console.log(response);
                msgError();
                exit;
            }
            // Extraia o JSON da resposta
            return response.json();
        })
    
    
        .then(data => {
            //Gravar endereco de faturamento na order
            console.log(data);
            order.billingAddressDto = data;
            if (checkboxDelivery.checked) {
                createDeliveryAddress();
            } else {
                createCreditCard();
            }   
        })
    
        .catch(error => {
            console.error('Erro ao criar usuário:', error);
            msgError();
            //alert("Erro ao tentar logar. Tente novamente mais tarde.");
        });
    }
    
//endereco de entrega
    function createDeliveryAddress() {

        const deliveryAddressData = {
            nickname: document.getElementById('apelidoDelivery').value, 
            zipCode: document.getElementById('zipCodeDelivery').value,
            addressType: document.getElementById('addressTypeDelivery').value,
            address: document.getElementById('addressDelivery').value,
            number: document.getElementById('numberDelivery').value,
            complement: document.getElementById('complementDelivery').value,
            neighborhood: document.getElementById('neighborhoodDelivery').value,
            city: document.getElementById('cityDelivery').value,
            state: document.getElementById('stateDelivery').value,
        };

        console.log(deliveryAddressData);
        order.deliveryAddressDto = deliveryAddressData;
        createCreditCard();
    }
   
    function createCreditCard() {
        if(selectedPaymentType === 'BL'){
            tokenCC = null;
            installmentsNumber = 1;

            let paymentDto = {
                "paymentType": selectedPaymentType,
                "creditCardToken": tokenCC,
                "installmentsNumber": installmentsNumber,
            };
            order.paymentDto = paymentDto;
            order.installmentsNumber = installmentsNumber;

            exibirResumoPedido();
        }else{
            const cardNumber = document.getElementById('cardNumber').value;
            const cvv = document.getElementById('cvv').value;
            const fullname = document.getElementById('fullname').value;
            const expireDate = document.getElementById('expireDate').value;
            //Gravar cartao de credito
            fetch('http://localhost:8080/creditCard/create', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${objUserAuth.token}`, 
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cardNumber: cardNumber,
                    cvv: cvv,
                    fullname: fullname,
                    expireDate: expireDate
                }),
            })
        
            .then(response => {
                // Diferente 200
                if (!response.ok) {
                    msgError();
                }
                // Extraia o JSON da resposta
                return response.json();
            })
        
        
            .then(data => {
                //Gravar forma de pagamento na order
                //console.log(data);
                tokenCC = data.token;
                installmentsNumber = document.getElementById('installmentsNumber').value;

                let paymentDto = {
                    "paymentType": selectedPaymentType,
                    "creditCardToken": tokenCC,
                    "installmentsNumber": installmentsNumber,
                    "creditCard": {
                        cardNumber: maskCreditCard(cardNumber),
                        cvv: cvv,
                        fullname: fullname,
                        expireDate: expireDate
                    }
                };
                order.paymentDto = paymentDto;
                order.installmentsNumber = installmentsNumber;

                exibirResumoPedido();
            })
        
            .catch(error => {
                console.error('Erro ao criar usuário:', error);
                msgError();
                //alert("Erro ao tentar logar. Tente novamente mais tarde.");
            });
        }
    }

    function exibirResumoPedido(){
        console.log(order);
        document.getElementById("billingTable").style.display = "none";
        document.getElementById("updateAddressForm").style.display = "none";
        document.getElementById("deliveryTable").style.display = "none";
        document.getElementById("createDeliveryAddressForm").style.display = "none";
        document.getElementById("uniqueSelectionTable").style.display = "none";
        document.getElementById("checkout-btn").innerHTML = "Finalizar Compra"
        document.getElementById("ResumoPedido").innerHTML = "Resumo do seu Pedido";
        document.getElementById("DetalheResumoPedido").style.display = "";
        document.getElementById("DetalheResumoPedido").innerHTML = "Valide o seu pedido e clique em 'Finalizar Compra' para concluir o seu pedido."
        document.getElementById("deliveryAddressTableOrder").style.display = "";
        document.getElementById("billingAddressTableOrder").style.display = "";
        document.getElementById("back-btn").style.display = "";

        function loadBillingAddress(billingAddress) {
            function populateTable(data) {
                const dataCell = document.querySelector('.address-data-cell-order');
                dataCell.textContent = `
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
    
        console.log(order.billingAddressDto);
        loadBillingAddress(order.billingAddressDto);

        function loadDeliveryAddress(deliveryAddress) {
            function populateTable(data) {
                const dataCell = document.querySelector('.deliveryAddress-data-cell-order');
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
    
        console.log(order.deliveryAddressDto);
        loadDeliveryAddress(order.deliveryAddressDto);        

        function loadPaymentData(paymentData) {
            function populatePaymentTable(data) {
                const dataCell = document.querySelector('.payment-data-cell-order');
                if (data.paymentType === "CC") {
                    dataCell.textContent = `
                    Tipo de Pagamento: Cartão de Crédito
                    Número do Cartão: ${data.creditCard.cardNumber}
                    CVV: ${data.creditCard.cvv}
                    Nome Completo: ${data.creditCard.fullname}
                    Data de Expiração: ${data.creditCard.expireDate}
                    Número de Parcelas: ${data.installmentsNumber}`;
                } else if (data.paymentType === "BL") {
                    dataCell.textContent = `
                    Tipo de Pagamento: Boleto`;
                }
            }

            populatePaymentTable(paymentData);
        }

        // Exemplo de uso
        loadPaymentData(order.paymentDto);

        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Para uma rolagem suave
        });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }

    function persistDeliveryAddress(){
        const deliveryAddressData = JSON.stringify(order.deliveryAddressDto);
        
        fetch('http://localhost:8080/customer/deliveryAddress/create', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${objUserAuth.token}`, 
                'Content-Type': 'application/json',
            },
            body: deliveryAddressData,
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
            //Gravar endereco de delivery na order
            console.log(data);
            order.deliveryAddressDto = data;
            enviarPedido()
        })
    
        .catch(error => {
            console.error('Erro ao criar usuário:', error);
            msgError();
            //alert("Erro ao tentar logar. Tente novamente mais tarde.");
        });
    }
    
    function enviarPedido(){
        /*let paymentDto = {
            "paymentType": selectedPaymentType,
            "creditCardToken": tokenCC
        };
        order.paymentDto = paymentDto;
        order.installmentsNumber = installmentsNumber;*/
        console.log(order);
    
        //Gravar pedido
        fetch('http://localhost:8080/shop/buy', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${objUserAuth.token}`, 
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(order),
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
            //limpar carrinho
            localStorage.removeItem("cart");
            msgPedidoRealizado(data.id);
            
        })
    
        .catch(error => {
            console.error('Erro ao criar usuário:', error);
            msgError();
            //alert("Erro ao tentar logar. Tente novamente mais tarde.");
        });
            // Redirecionar para página de pedido concluido
            //window.location.href = 'shop-order.html';
    }
    



});

document.getElementById('back-btn').addEventListener('click', function() {
    event.preventDefault();
    document.getElementById("billingTable").style.display = "";
    document.getElementById("updateAddressForm").style.display = "";
    document.getElementById("deliveryTable").style.display = "";
    document.getElementById("createDeliveryAddressForm").style.display = "";
    document.getElementById("uniqueSelectionTable").style.display = "";
    document.getElementById("checkout-btn").innerHTML = "Concluir Compra"
    document.getElementById("ResumoPedido").innerHTML = "Dados do seu Pedido";
    document.getElementById("DetalheResumoPedido").style.display = "none";
    document.getElementById("DetalheResumoPedido").innerHTML = ""
    document.getElementById("deliveryAddressTableOrder").style.display = "none";
    document.getElementById("billingAddressTableOrder").style.display = "none";
    document.getElementById("back-btn").style.display = "none";
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Para uma rolagem suave
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
})





function msgError(){
    Swal.fire({
      title: "Criação inválida!",
      text: "Ocorreu um erro desconhecido",
      icon: "error"
    });
}

function msgErrorValidation(){
    Swal.fire({
      text: "Preencha os dados obrigatórios para finalizar seu pedido",
      icon: "error"
    });
}


function msgErrorValidationFormaPagamento(){
    Swal.fire({
      text: "Preencha a forma de pagamento para finalizar seu pedido",
      icon: "error"
    }).then((result) => {
        if (result.isConfirmed) {
            const checkboxBL = document.getElementById('checkboxBL');
            checkboxBL.focus();
        }
    });
}


function msgErrorValidationDelivery(){
    Swal.fire({
      text: "Preencha o endereço de entrega para finalizar seu pedido",
      icon: "error"
    }).then((result) => {
        if (result.isConfirmed) {
            const tblcreateDeliveryAddressForm = document.getElementById("createDeliveryAddressForm")
            tblcreateDeliveryAddressForm.focus();
        }
    });
}

function msgPedidoRealizado(orderNumber){
    
    Swal.fire({
        title: "Pedido criado com sucesso!",
        text: `Número do pedido: ${orderNumber}`,
        icon: "success",
        confirmButtonText: "OK"
    }).then((result) => {
        if (result.isConfirmed) {
            // Redireciona para a página desejada
            window.location.href = `shop-detalhe-pedido.html?orderNumber=${orderNumber}&NovoPedido=S`;
        }
    });
}

function msgValidate(text){
    Swal.fire({
      text: text,
      icon: "error"
    });
}

document.getElementById('expireDate').addEventListener('input', function(e) {
    let input = e.target.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    if (input.length > 2) {
        input = input.substring(0, 2) + '/' + input.substring(2, 6);
    }
    e.target.value = input;
});

document.getElementById('expireDate').addEventListener('blur', function(e) {
    let input = e.target.value;
    const parts = input.split('/');
    if (parts.length === 2) {
        const month = parseInt(parts[0], 10);
        const year = parseInt(parts[1], 10);
        
        // Verifica se o mês está entre 1 e 12
        if (month < 1 || month > 12) {
            msgValidate('Por favor, insira um mês válido entre 01 e 12.');
            e.target.value = '';
            return;
        }
        
        // Verifica se o ano tem quatro dígitos
        if (parts[1].length !== 4) {
            msgValidate('Por favor, insira um ano válido com quatro dígitos.');
            e.target.value = '';
            return;
        }

        // Obtém o mês e ano atuais
        const date = new Date();
        const currentMonth = date.getMonth() + 1; // Mês atual (0-11)
        const currentYear = date.getFullYear();   // Ano atual

        // Verifica se a data inserida não está no passado
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            msgValidate('Cartão de crédito vencido, insira um válido.');
            e.target.value = '';
            return;
        }
    } else {
        msgValidate('Por favor, insira a data no formato MM/YYYY.');
        e.target.value = '';
    }
});

document.getElementById('installmentsNumber').addEventListener('input', function(e) {
    const installmentsError = document.getElementById('installmentsError');
    let input = e.target.value;

    // Remove todos os caracteres não numéricos
    input = input.replace(/\D/g, '');

    // Valida se o valor está entre 1 e 12
    if (input !== '' && (parseInt(input, 10) < 1 || parseInt(input, 10) > 12)) {
        installmentsError.textContent = 'Por favor, insira um número válido entre 1 e 12.';
        e.target.value = '';
    } else {
        installmentsError.textContent = '';
    }

    e.target.value = input;
});


window.IrHome = IrHome;
window.onload = onLoad;
window.handleSelection = handleSelection;
window.enableCreditCardDetails = enableCreditCardDetails;