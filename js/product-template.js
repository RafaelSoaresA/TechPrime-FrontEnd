import * as myLocalStorage from './myLocalStorage.js';

const header = document.querySelector("header");
const menuIcon = document.getElementById("menu-icon");
const navMenu = document.querySelector(".navmenu");
let currentIndex = 0;

const swiper = new Swiper('.swiper-container', {
    loop: true,  // Faz o carrossel girar em loop
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});

window.addEventListener("scroll", function() {
    header.classList.toggle("sticky", this.window.scrollY > 0);
});

// Função para alternar a classe "open" no menu de navegação ao clicar no ícone de menu
menuIcon.addEventListener("click", function() {
    navMenu.classList.toggle("open");
});


const jsonAuth = myLocalStorage.getItemWithExpiry("UserAuth");
const objUserAuth = JSON.parse(jsonAuth);
console.log(objUserAuth);

const url = new URL(window.location.href);
const carouselContainer = document.getElementById('carouselContainer');
carouselContainer.innerHTML = '';
const productId = url.searchParams.get('productId');


function getImages(){
    fetch(`http://localhost:8080/products/images/${productId}`, {
        method: 'GET',
        headers: {
            //'Authorization': `Basic ${objUserAuth.token}`, 
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
            iniciarCarrossel(data);
        })
        .catch(error => {
            console.error('Erro ao trazer as imagens do produto:', error);
            msgError();
    });
}

function fillInputField() {
    fetch(`http://localhost:8080/products/product-info/${productId}`, {
        method: 'GET',
        headers: {
            //'Authorization': `Basic ${objUserAuth.token}`,
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            msgError();
            throw new Error('Erro na resposta da API');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('name').innerText = data.name;
        document.getElementById('description').innerText = data.description;
        document.getElementById('price').innerText = `R$ ${data.price}`;
        document.getElementById('rating').innerText = data.rating;
    })
    .catch(error => {
        console.error('Erro ao trazer informações do produto:', error);
        msgError();
    });
    getImages();
}

window.onload = fillInputField;

const stars = document.querySelectorAll('.rating i');
const ratingValue = document.getElementById('rating-value');

stars.forEach(star => {
    star.addEventListener('click', () => {
        const value = star.getAttribute('data-value');
        ratingValue.textContent = `Nota: ${value}` ;
        
        stars.forEach(s => {
            s.classList.remove('selected'); // Remove a seleção das estrelas
        });
        
        for (let i = 0; i < value; i++) {
            stars[i].classList.add('selected'); // Seleciona as estrelas até a nota escolhida
        }
    });
});
document.addEventListener('DOMContentLoaded', () => {
  
    function getProductDetails() {
      const name = document.getElementById('name').innerText;
      const description = document.getElementById('description').innerText;
      const price = parseFloat(document.getElementById('price').innerText.replace('R$', '').trim());
      const rating = document.getElementById('rating').innerText;
      const url_image = document.getElementById("img1").value
      const id = productId;
  
      return { id, name, description, price, rating, url_image, quantity: 1 };
    }
 
    function addToCart(product) {
      let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
      const productIndex = cart.findIndex(item => item.id === product.id);
  
      if (productIndex !== -1) {
        cart[productIndex].quantity += 1;
      } else {

        cart.push(product);
      }
  
      localStorage.setItem('cart', JSON.stringify(cart));
    }

    const addButton = document.getElementById('adicionarAoCarrinho');
    if (addButton) {
      addButton.addEventListener('click', () => {
        const product = getProductDetails();
        if (product.id) {
          addToCart(product);
          // Redirecionar para a página de carrinho
          window.location.href = 'shop-cart.html';
        } else {
          alert('Produto não encontrado!');
        }
      });
    } else {
      console.error("Botão 'Adicionar ao Carrinho' não encontrado!");
    }
  });

function iniciarCarrossel(data) {
    const carouselContainer = document.getElementById('carouselContainer');
    let currentIndex = 0;
    let count = 0;

    data.forEach(item => {
        if (count == 0) {
            document.getElementById("img1").value = item.urlImage;
        }
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carouselItem');
        
        const img = document.createElement('img');
        img.src = item.urlImage;
        carouselItem.appendChild(img);
        
        carouselContainer.appendChild(carouselItem);
        count = 1;
    });

    function updateButtonVisibility() {
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        
        if (currentIndex === 0) {
            prevButton.style.display = 'none';  
        } else {
            prevButton.style.display = 'block';  
        }
        
        if (currentIndex === data.length - 1) {
            nextButton.style.display = 'none';  
        } else {
            nextButton.style.display = 'block'; 
        }
    }

    function updateCarousel() {
        const offset = -currentIndex * 100;  
        carouselContainer.style.transform = `translateX(${offset}%)`;
        updateButtonVisibility();
    }
    

    document.getElementById('nextButton').addEventListener('click', () => {
        if (currentIndex < data.length - 1) {
            currentIndex++;
            updateCarousel();
        }
    });

    document.getElementById('prevButton').addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    updateButtonVisibility();
}
  
  console.log(JSON.parse(localStorage.getItem('cart')));
  