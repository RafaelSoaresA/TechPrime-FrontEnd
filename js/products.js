import * as myLocalStorage from './myLocalStorage.js';

 // Recupere a string do localStorage
 const jsonAuth = myLocalStorage.getItemWithExpiry("UserAuth");


 // Converta a string de volta para um objeto JSON
 const objUserAuth = JSON.parse(jsonAuth);
 console.log(objUserAuth);


 export function toggleProductStatus(productId, checkbox) {
    const isActive = checkbox.checked;
    const status = isActive ? 'activated' : 'deactivated';

    fetch(`http://localhost:8080/products/alter/${productId}/${status}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Basic ${objUserAuth.token}`, 
        },
        body: JSON.stringify({ active: isActive })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao atualizar o status do produto');
        }
        console.log(`Produto ${productId} ${status}.`);

        const label = checkbox.nextElementSibling.nextElementSibling;
        label.textContent = isActive ? 'Ativado' : 'Desativado';
    })
    .catch(error => console.error('Erro ao atualizar o status do produto:', error));
}

export function editProduct(productId) {
    // Substitua 'novaPagina.html' pela URL da página que você deseja redirecionar
    window.location.href = `updateProduct.html?productId=${productId}`;
}

export function enterProduct(productId){
    // Substitua 'novaPagina.html' pela URL da página que você deseja redirecionar
    window.location.href = `product.html?productId=${productId}`;
}
function fetchProducts() {
    fetch('http://localhost:8080/products/list',{
        method: 'GET',
        headers: {
            'Authorization': `Basic ${objUserAuth.token}`, 
            'Content-Type': 'application/json',
        },
    }) 
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na resposta da rede');
            }
            return response.json();
        })
        .then(products => {
            const productTableBody = document.getElementById('productTableBody');
            productTableBody.innerHTML = '';

            const filteredProducts = products.filter(product => product.name.toLowerCase());

            filteredProducts.forEach(product => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td onclick="enterProduct(${product.id})" class="enterProduct">${product.name}</td>
                    <td>${product.price}</td>
                    <td>${product.quantity}</td>
                    <td>${product.type}</td>
                    <td>
                        <label class="switch">
                            <input type="checkbox" ${product.deleted ? '' : 'checked'} onchange="toggleProductStatus(${product.id}, this)">
                            <span class="slider"></span>
                        </label>
                    </td>
                    <td>
                        <button onclick="editProduct(${product.id})">Editar</button>
                    </td>
                `;
                productTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Erro ao buscar usuários:', error));
}

export function filterTable() {
    var input = document.getElementById('searchInput');
    var filter = input.value.toLowerCase();
    var tableBody = document.getElementById('productTableBody');
    var rows = tableBody.getElementsByTagName('tr');

    
    for (var i = 0; i < rows.length; i++) {
        var productNameCell = rows[i].getElementsByTagName('td')[1];
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

if (objUserAuth == null){
    window.location.href = 'semacesso.html';
}

window.onload = fetchProducts;
window.filterTable = filterTable;
window.editProduct = editProduct;
window.toggleProductStatus = toggleProductStatus;
window.enterProduct = enterProduct;
