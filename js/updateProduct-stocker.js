import * as myLocalStorage from './myLocalStorage.js';

const jsonAuth = myLocalStorage.getItemWithExpiry("UserAuth");
// Converta a string de volta para um objeto JSON
const objUserAuth = JSON.parse(jsonAuth);
console.log(objUserAuth);

const url = new URL(window.location.href);


function getSituacaoProduto(boolStatus) {
    if (boolStatus) {
        return 'Ativo';
    } else {
        return 'Inativo';
    }
}


// Pega o id do produto
const productId = url.searchParams.get('productId');

function getImages(){
    fetch(`http://localhost:8080/products/images/${productId}`, {
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
        const tableBody = document.getElementById('tabImagens').getElementsByTagName('tbody')[0]; 
        while (tableBody.rows.length > 0) { 
            tableBody.deleteRow(0); 
        }
        data.forEach(item => { const row = tableBody.insertRow(); 
            const cell1 = row.insertCell(0); 
            const cell2 = row.insertCell(1);
            const img = document.createElement('img'); 
            img.src = item.urlImage; 
            img.style.width = '50px'; 
            img.style.height = '50px';
            cell2.appendChild(img);
            cell1.textContent = "excluir";

            cell1.addEventListener('click', () => { 
                handleRowClick(item); 
            });
        });
    })
    .catch(error => {
        console.error('Erro ao trazer as imagens do produto:', error);
        msgError();
    });
}
function fillInputField(){
    fetch(`http://localhost:8080/products/product-info/${productId}`, {
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
        document.getElementById('type').value = data.type;
        document.getElementById('price').value = data.price;
        document.getElementById('quantity').value = data.quantity;
        document.getElementById('rating').value = data.rating;
        document.getElementById('description').value = data.description;
        document.getElementById('deleted_at').value = getSituacaoProduto(!data.status);
    })
    .catch(error => {
        console.error('Erro ao trazer informações do produto:', error);
        msgError();
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    });
    getImages();
}
window.onload = fillInputField;
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Evita o envio do formulário

    // Recupere a string do localStorage
  
    // Config do Json
    const name = document.getElementById('name').value;
    const type = document.getElementById('type').value;
    const price = document.getElementById('price').value;
    const quantity = document.getElementById('quantity').value;
    const rating = document.getElementById('rating').value;
    const description = document.getElementById('description').value;
    const deleted = document.getElementById('deleted_at').value;
    
    fetch(`http://localhost:8080/products/update/${productId}`, {
        method: 'PUT',
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
        }

        // Extraia o JSON da resposta
        return response.json();
    })

    .then(data => {
        window.location.href = 'products-list-stocker.html';
    })
    .catch(error => {
        console.error('Erro ao criar usuário:', error);
        //alert("Erro ao tentar logar. Tente novamente mais tarde.");
    });

    // Mensagem de Erro
    function msgError(){
        Swal.fire({
          title: "Criação inválida!",
          text: "Preencha todos os campos",
          icon: "error"
        });
      }

});

document.getElementById('btn_incluirImagem').addEventListener('click', function() {
    event.preventDefault(); 
    const urlImage = document.getElementById('prd-img').value;
    
    const data = { product: { id: productId }, urlImage: urlImage };

    console.log(data);

    fetch('http://localhost:8080/products/insert/image', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${objUserAuth.token}`, 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(response => {
        // Diferente 200
        if (!response.ok) {
            msgError();
            console.log(response);
            return;
        }
        // Extraia o JSON da resposta
        return response.json();
    }).then(data => {
        getImages();
    })
    .catch(error => {
        console.error('Erro ao excluir as imagens do produto:', error);
        msgError();
    });
});

function handleRowClick(item) { 
    fetch(`http://localhost:8080/products/delete/image/${item.id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Basic ${objUserAuth.token}`, 
            'Content-Type': 'application/json',
        }

    })
    .then(response => {
        // Diferente 200
        if (!response.ok) {
            msgError();
            console.log(response);
            return;
        }
        // Extraia o JSON da resposta
        return response.json();
    }).then(data => {
        getImages();
    })
    .catch(error => {
        console.error('Erro ao excluir as imagens do produto:', error);
        msgError();
    });

    
}


function msgError(){
    Swal.fire({
      text: "Ocorreu um erro desconhecido",
      icon: "error"
    });
}





