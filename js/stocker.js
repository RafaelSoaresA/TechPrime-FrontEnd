import * as myLocalStorage from './myLocalStorage.js';


const header = document.querySelector("header");
const menuIcon = document.getElementById("menu-icon");
const navMenu = document.querySelector(".navmenu");

window.addEventListener("scroll", function() {
    header.classList.toggle("sticky", this.window.scrollY > 0);
});

menuIcon.addEventListener("click", function() {
    navMenu.classList.toggle("open");
});

// Recupere a string do localStorage
const jsonAuth = myLocalStorage.getItemWithExpiry("UserAuth");


// Converta a string de volta para um objeto JSON
const objUserAuth = JSON.parse(jsonAuth);
console.log(objUserAuth); 

if (objUserAuth == null){
    window.location.href = 'semacesso.html';
}

export function editUser(objUserAuth) {
    // Substitua 'novaPagina.html' pela URL da página que você deseja redirecionar
    window.location.href = `updateUser.html?userId=${objUserAuth}`;
}

window.editUser = editUser;
