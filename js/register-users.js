import * as myLocalStorage from './myLocalStorage.js';

 // Recupere a string do localStorage
 const jsonAuth = myLocalStorage.getItemWithExpiry("UserAuth");


 // Converta a string de volta para um objeto JSON
 const objUserAuth = JSON.parse(jsonAuth);
 console.log(objUserAuth);
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o envio do formulário

   
    // Config do Json
    const username = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const credit = document.getElementById('credit').value;
    const role = document.getElementById('role').value;
    const deleted = document.getElementById('deleted_at').value;

   
    fetch('http://localhost:8080/api/create', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${objUserAuth.token}`, 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            name: username, 
            email: email, 
            password: password,
            credit: credit, 
            role: role, 
            deleted_at: deleted}),
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
            title: "Cadastro realizado com sucesso!",
            icon: "success",
            confirmButtonText: "OK"
        }).then((result) => {
            if (result.isConfirmed) {
                // Redireciona para a página desejada
                window.location.href = 'users-list.html';
            }
        });
    }
    
});


