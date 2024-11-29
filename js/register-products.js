import * as myLocalStorage from './myLocalStorage.js';

document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o envio do formulário

    // Recupere a string do localStorage
    const jsonAuth = myLocalStorage.getItemWithExpiry("UserAuth");


    // Converta a string de volta para um objeto JSON
    const objUserAuth = JSON.parse(jsonAuth);

    // Config do Json
    const name = document.getElementById('name').value;
    const type = document.getElementById('type').value;
    const price = document.getElementById('price').value;
    const quantity = document.getElementById('quantity').value;
    const rating = document.getElementById('rating').value;
    const description = document.getElementById('description').value;
    const deleted = 0;
    
    fetch('http://localhost:8080/products/create', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${objUserAuth.token}`, 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name, 
            type: type, 
            price: price, 
            quantity: quantity, 
            rating: rating, 
            description: description,
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

    .then(response => {
        console.log(response);
        msgAlteracaoRealizada();
    })

    // Mensagem de Erro
    function msgError(){
        Swal.fire({
          title: "Criação inválida!",
          text: "Erro inesperado!",
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
                window.location.href = 'products-list.html';
            }
        });
    }
    
});

