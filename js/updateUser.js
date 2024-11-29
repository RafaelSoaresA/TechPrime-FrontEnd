import * as myLocalStorage from './myLocalStorage.js';

 // Recupere a string do localStorage
const jsonAuth = myLocalStorage.getItemWithExpiry("UserAuth");
const objUserAuth = JSON.parse(jsonAuth);
console.log(objUserAuth);

const url = new URL(window.location.href);
let userId = url.searchParams.get('userId');
let currentUser = false;

if (!userId) {
    currentUser = true;
    userId = objUserAuth.id;
}


function getSituacaoUsuario(boolStatus) {
    if (boolStatus) {
        return 'Ativo';
    } else {
        return 'Inativo';
    }
}


 function fillInputField(){
    fetch(`http://localhost:8080/api/user-info/${userId}`, {
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
        document.getElementById('name').value = data.name;
        document.getElementById('email').value = data.email;
        document.getElementById('credit').value = data.credit;
        document.getElementById('role').value = data.role;
        document.getElementById('deleted_at').value = getSituacaoUsuario(!data.status);
    })
    .catch(error => {
        console.error('Erro ao trazer informações do usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    });
}

window.onload = fillInputField;

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o envio do formulário

    // Config do Json
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const credit = document.getElementById('credit').value;
    const passCreateRepeat = document.getElementById("passCreateRepeat").value;
    const passwordError = document.getElementById('passwordError');

    //const deleted = document.getElementById('deleted_at').value;

    console.log(userId);
    console.log(role);
    console.log(credit);
   
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
            id: userId,
            password: password,
            role: role,
            credit: credit,
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
        console.log(data);
        msgAlteracaoRealizada();
    })

    .catch(error => {
        console.error('Erro ao criar usuário:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    });

    // Mensagem de Erro
    function msgError(){
        Swal.fire({
          title: "Criação inválida!",
          text: "Confirme todos os campos",
          icon: "error"
        });
    }

    function msgAlteracaoRealizada(){
    
        Swal.fire({
            title: "Alteração realizada com sucesso!",
            icon: "success",
            confirmButtonText: "OK"
        }).then((result) => {
            if (result.isConfirmed) {
                // Redireciona para a página desejada
                if (objUserAuth) {
                    if (objUserAuth && objUserAuth.role === "admin") {
                        if (currentUser) {
                            window.location.reload();
                        } else {
                            window.location.href = 'users-list.html';
                        }
                    } else if (objUserAuth && objUserAuth.role === "stocker") {
                        window.location.reload();
                    } else {
                        window.location.href = 'login.html';
                    }
                } else {
                    window.location.href = 'login.html';
                }
            }
        });
    }

    
});

document.getElementById('clearStorageButton').addEventListener('click', function() {
    event.preventDefault();

    // Limpar o localStorage
    myLocalStorage.removeitem("UserAuth");

    // Redirecionar para a página index.html
    window.location.href = '../index.html';
});