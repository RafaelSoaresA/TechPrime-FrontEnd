import * as myLocalStorage from './myLocalStorage.js';
function fetchListProducts() {
    const productList = document.getElementById("product-list");

    fetch('http://localhost:8080/products/list', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        // Itera sobre os produtos e cria o HTML dinamicamente
        data.forEach(product => {
            const productRow = document.createElement("div");
            productRow.className = "row";

            function getImages() {
                fetch(`http://localhost:8080/products/images/${product.id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                .then(response => {
                    // Verifica se a resposta foi bem-sucedida
                    if (!response.ok) {
                        msgError();
                        return;
                    }
                    return response.json();
                })
                .then(imagesData => {
                    // Aqui, selecionamos apenas a primeira imagem
                    if (imagesData && imagesData.length > 0) {
                        // Adiciona a primeira imagem ao produto
                        const firstImageUrl = imagesData[0].urlImage; // Supondo que a imagem tenha a propriedade 'urlImage'
                        displayProduct(productRow, firstImageUrl);
                    } else {
                        console.log("Nenhuma imagem encontrada para o produto", product.id);
                        displayProduct(productRow, "default-image-url.jpg"); // Imagem padrão caso não tenha imagens
                    }
                })
                .catch(error => {
                    console.error('Erro ao trazer as imagens do produto:', error);
                    msgError();
                });
            }

            // Função para exibir o produto com a primeira imagem
            function displayProduct(productRow, firstImageUrl) {
                productRow.innerHTML = `
                    <a href="product-template.html?productId=${product.id}">
                        <img src="${firstImageUrl}" referrerpolicy="no-referrer" alt="Imagem">
                        <div class="product-text">
                            <h5>${product.type}</h5>
                        </div>
                        <div class="heart-icon">
                            <i class='bx bx-heart'></i>
                        </div>
                        <div class="rating">
                            <i class='bx bxs-star'></i>
                            <i class='bx bxs-star'></i>
                            <i class='bx bxs-star'></i>
                            <i class='bx bxs-star'></i>
                            <i class='bx bxs-star-half'></i>
                        </div>
                        <div class="price">
                            <h4>${product.name}</h4>
                            <p>R$ ${product.price}</p>
                        </div>
                    </a>
                `;

                productList.appendChild(productRow);
            }

            // Chama a função que traz as imagens e exibe o produto
            getImages();
        });
    })
    .catch(error => console.error("Erro ao carregar produtos:", error));
}

export function IrHome() { 
    const objUserAuth = JSON.parse(myLocalStorage.getItemWithExpiry('UserAuth'));

    if (objUserAuth) {
        window.location.href = 'customer/profile.html';
    } else {
        window.location.href = 'login.html';
    }

}

window.onload = fetchListProducts;
window.IrHome = IrHome;