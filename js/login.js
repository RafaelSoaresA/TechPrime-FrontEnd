import * as myLocalStorage from './myLocalStorage.js';

document.addEventListener('DOMContentLoaded', function() {
    const objUserAuth = JSON.parse(myLocalStorage.getItemWithExpiry('UserAuth'));

    if (objUserAuth && objUserAuth.role === "admin") {
        window.location.href = 'admin/admin.html';
    } else if (objUserAuth && objUserAuth.role === "stocker") {
        window.location.href = 'stocker/estoquista.html';
    } else if (objUserAuth && objUserAuth.role === "customer") {
        window.location.href = 'shop.html';
    }
});


const url = new URL(window.location.href);
const ReturnUrl = url.searchParams.get('ReturnUrl');
if (ReturnUrl) {
    document.getElementById("lnkRegister").href = "customer/register.html?ReturnUrl="+ReturnUrl;
} else {
    document.getElementById("lnkRegister").href = "customer/register.html";
}



document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o envio do formulário

    // Config do Json
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://localhost:8080/api/auth', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, password: password }),
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

        // Converte o objeto JSON para string
        const jsonString = JSON.stringify(data);

        myLocalStorage.setItemWithExpiry("UserAuth", jsonString, 1);

        const jsonString2 = myLocalStorage.getItemWithExpiry("UserAuth");
        // Converte a string de volta para um objeto JSON
        const objUserAuth = JSON.parse(jsonString2);
        console.log(objUserAuth); 

        const url = new URL(window.location.href);
        const ReturnUrl = url.searchParams.get('ReturnUrl');

        if(objUserAuth.role == "admin"){
            window.location.href = 'admin/admin.html';
        }else if(objUserAuth.role == "stocker"){
            window.location.href = 'stocker/estoquista.html';
        } else {
            if (ReturnUrl) {
                window.location.href = ReturnUrl;
            } else {
                window.location.href = 'index.html';    
            }
        }
        
    })
    .catch(error => {
        console.error('Erro ao fazer login:', error);
    });

    // Mensagem de Erro
    function msgError(){
        Swal.fire({
          title: "Email ou senha inválidos!",
          text: "Caso não houver um usuário, realize o cadastramento.",
          icon: "error"
        });
      }
});