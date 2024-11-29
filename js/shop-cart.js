import * as myLocalStorage from './myLocalStorage.js';

let shippingCost = 0;
let shippingType = "";
let totalPrice = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Função para carregar o carrinho do localStorage
  function loadCart() {
    const cart = JSON.parse(localStorage.getItem("cart"));
    return cart;
  }

  console.log(JSON.parse(localStorage.getItem("cart")));

  // Função para exibir os itens do carrinho na página
  function displayCartItems() {
    const cartItemsContainer = document.querySelector(".cart-items");
    const cartSummaryContainer = document.querySelector(
      ".cart-summary .total p:last-child"
    );

    const cart = loadCart();

    // Se o carrinho estiver vazio, exibe uma mensagem
    if (cart === null || cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
      cartSummaryContainer.innerText = "R$ 0,00";
      return;
    }

    // Limpa o conteúdo anterior da lista de itens
    cartItemsContainer.innerHTML = "";

    // Função para calcular o preço total
    function calcularTotal() {
      totalPrice = 0; // Reseta o total a cada cálculo
      cart.forEach((item) => {
        totalPrice += item.price * item.quantity;
      });
      // Adiciona o valor do frete
      const freteSelecionado = document.querySelector('input[name="frete"]:checked');
      if (freteSelecionado) {
        totalPrice += parseFloat(freteSelecionado.value);
        shippingCost = parseFloat(freteSelecionado.value);
        shippingType = freteSelecionado.id;
        console.log(shippingCost);
        console.log(shippingType);
      }
      // Atualiza o resumo do preço total
      cartSummaryContainer.innerText = `R$ ${totalPrice.toFixed(2)}`;
    }

    function iterarCart() {
      cart.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.className = "cart-item";

        itemElement.innerHTML = `
          <img src="${item.url_image}" alt="${item.name}">
          <div class="item-details">
            <h3>${item.name}</h3>
            <p>Quantidade: <input type="number" value="${item.quantity}" min="1" max="5" data-id="${item.id}" class="quantity-input"></p>
            <p>Preço: R$ ${item.price.toFixed(2)}</p>
          </div>
          <button class="remove-btn" data-id="${item.id}"><i class='bx bx-trash'></i> Remover</button>
        `;

        cartItemsContainer.appendChild(itemElement);
      });

      // Atualiza o preço total após carregar os itens do carrinho
      calcularTotal();

      // Evento de mudança do frete
      document.querySelectorAll('input[name="frete"]').forEach(function (radio) {
        radio.addEventListener("change", function () {
          // Recalcula o total com o novo valor de frete
          calcularTotal();
        });
      });
    }

    iterarCart();
  }

  // Função para atualizar a quantidade de um item no localStorage
  function updateItemQuantity(id, newQuantity) {
    let cart = loadCart();
    const itemIndex = cart.findIndex((item) => item.id === id);

    if (itemIndex !== -1) {
      cart[itemIndex].quantity = newQuantity;
      localStorage.setItem("cart", JSON.stringify(cart));
      displayCartItems(); // Recarrega a exibição dos itens
    }
  }

  // Função para remover um item do carrinho
  function removeCartItem(id) {
    let cart = loadCart();
    cart = cart.filter((item) => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCartItems(); // Recarrega a exibição dos itens
  }

  // Event Listener para atualizar a quantidade quando o valor do input é alterado
  document.querySelector(".cart-items").addEventListener("input", (event) => {
    if (event.target.classList.contains("quantity-input")) {
      const newQuantity = parseInt(event.target.value, 10);
      const itemId = event.target.getAttribute("data-id");
      updateItemQuantity(itemId, newQuantity);
    }
  });

  // Event Listener para o botão de remover item
  document.querySelector(".cart-items").addEventListener("click", (event) => {
    if (
      event.target.classList.contains("remove-btn") ||
      event.target.closest(".remove-btn")
    ) {
      const itemId = event.target
        .closest(".remove-btn")
        .getAttribute("data-id");
      removeCartItem(itemId);
    }
  });

  // Exibe os itens do carrinho ao carregar a página
  displayCartItems();
});


document.getElementById('checkout-btn').addEventListener('click', function() {
    event.preventDefault();

    const freteSelecionado = document.querySelector('input[name="frete"]:checked');
    if (!freteSelecionado) {
        Swal.fire({
            text: "Selecione um método de envio.",
            icon: "warning",
          });
        return;
    }

    // Recupere a string do localStorage
    const cart = JSON.parse(localStorage.getItem('cart'));
    console.log(cart);

    let strOrder = {
        "shippingCost": shippingCost,
        "shippingType": shippingType,
        "products": cart,
        "totalPrice": totalPrice
    }
    console.log(strOrder);
    localStorage.setItem('order', JSON.stringify(strOrder));

    const objUserAuth = JSON.parse(myLocalStorage.getItemWithExpiry('UserAuth'));

    if (objUserAuth) {
        window.location.href = 'shop-order.html';
    } else {
        window.location.href = 'login.html?ReturnUrl=shop-order.html';
    }

    //window.location.href = 'shop-order.html';

});


export function IrHome() { 
    const objUserAuth = JSON.parse(myLocalStorage.getItemWithExpiry('UserAuth'));

    if (objUserAuth) {
        window.location.href = 'customer/profile.html';
    } else {
        window.location.href = 'login.html';
    }

}

window.IrHome = IrHome;