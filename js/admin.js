import * as myLocalStorage from './myLocalStorage.js';

document.addEventListener('DOMContentLoaded', function() {
    const objUserAuth = JSON.parse(myLocalStorage.getItemWithExpiry('UserAuth'));

    if (objUserAuth && objUserAuth.role === "admin") {
        //window.location.href = 'admin/admin.html';
    } else if (objUserAuth && objUserAuth.role === "stocker") {
        window.location.href = '../stocker/estoquista.html';
    } else if (objUserAuth && objUserAuth.role === "customer") {
        window.location.href = '../customer/profile.html';
    }
});


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
