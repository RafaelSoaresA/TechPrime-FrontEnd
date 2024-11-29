import * as myLocalStorage from './myLocalStorage.js';

 // Recupere a string do localStorage
 const jsonAuth = myLocalStorage.getItemWithExpiry("UserAuth");


 // Converta a string de volta para um objeto JSON
 const objUserAuth = JSON.parse(jsonAuth);
 console.log(objUserAuth);


 function converterGenero(codigo) {
    const tipoMap = {
        'M': 'Masculino',
        'F': 'Feminino',
        'N': 'Prefiro não informar'
    };
    return tipoMap[codigo] || 'Tipo Desconhecido';
}


 function onLoad() {
    fillInputField();
    loadCustomer();
}

 function fillInputField(){
    fetch(`http://localhost:8080/api/user-info/${objUserAuth.id}`, {
        method: 'GET',
        headers: {
            'Authorization': `Basic ${objUserAuth.token}`, 
            'Content-Type': 'application/json',
        }
    })

    .then(response => {
        // Diferente 200
        if (!response.ok) {
            msgError();
        }
        // Extraia o JSON da resposta
        return response.json();
    }).then(data => {
        //document.getElementById('name').value = data.name;
        document.getElementById('email').value = data.email;
        document.getElementById('credit').value = data.credit;
        //document.getElementById('role').value = data.role;
        //document.getElementById('deleted_at').value = data.status;
    })
    .catch(error => {
        console.error('Erro ao trazer informações do usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    });
}


function loadCustomer(){

    function populateTable(data) {
        document.getElementById('name').value = data.fullname;
        document.getElementById('cpf').value = data.document;
        document.getElementById('birthDate').value = data.birthDate;
        document.getElementById('gender').value = converterGenero(data.gender);
        document.getElementById('phone1').value = data.phone1;
        document.getElementById('phone2').value = data.phone2;
    }

    fetch(`http://localhost:8080/customer/user`, {
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
        populateTable(jsonData);
    })
    
    .catch(error => {
        console.error('Erro ao criar usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    }); 

}

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o envio do formulário

    const jsonAuth = myLocalStorage.getItemWithExpiry("UserAuth");
    const objUserAuth = JSON.parse(jsonAuth);
    
    console.log(objUserAuth);

    // Config do Json
    const password = document.getElementById('password').value;
    const passCreateRepeat = document.getElementById("passCreateRepeat").value;
    const passwordError = document.getElementById('passwordError');
    const email = document.getElementById('email').value;
    const fullname = document.getElementById('name').value;
    const phone1 = document.getElementById('phone1').value;
    const phone2 = document.getElementById('phone2').value;

    if (password !== passCreateRepeat) {
        document.getElementById("passCreateRepeat").focus();
        passwordError.textContent = 'As senhas não são iguais. Por favor, tente novamente.';
        return;
    } else {
        passwordError.textContent = '';
    }
    fetch('http://localhost:8080/api/update', {
        method: 'PUT',
        headers: {
            'Authorization': `Basic ${objUserAuth.token}`, 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: objUserAuth.id,
            password: password,
            email: email,
            customerDto: {
                    fullname: fullname,
                    phone1: phone1,
                    phone2: phone2
            }
        }),
    })

    .then(response => {
        // Diferente 200
        if (!response.ok) {
            msgError();
            console.log(response);
            exit;
        }
        // Extraia o JSON da resposta
        return response.json();
    })


    .then(data => {
        msgSucesso();
        console.log(data);
    })

    .catch(error => {
        console.error('Erro ao criar usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    });

    // Mensagem de Erro
    function msgError(){
        Swal.fire({
          text: "Ocorreu um erro inesperado!",
          icon: "error"
        });
    }

    function msgSucesso(){
        Swal.fire({
          text: "Alteração realizada com sucesso!",
          icon: "success"
        });
    }
    
});

document.getElementById('clearStorageButton').addEventListener('click', function() {
    // Limpar o localStorage
    myLocalStorage.removeitem("UserAuth");
    
    // Redirecionar para a página index.html
    window.location.href = '../index.html';
});


window.onload = onLoad;