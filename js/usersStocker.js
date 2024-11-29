import * as myLocalStorage from './myLocalStorage.js';

 // Recupere a string do localStorage
 const jsonAuth = myLocalStorage.getItemWithExpiry("UserAuth");


 // Converta a string de volta para um objeto JSON
 const objUserAuth = JSON.parse(jsonAuth);
 console.log(objUserAuth);


 export function filterTable() {
    var input = document.getElementById('searchInput');
    var filter = input.value.toLowerCase();
    var tableBody = document.getElementById('userTableBody');
    var rows = tableBody.getElementsByTagName('tr');

    
    for (var i = 0; i < rows.length; i++) {
        var userNameCell = rows[i].getElementsByTagName('td')[1];
        if (userNameCell) {
            var userName = userNameCell.textContent || userNameCell.innerText;
            if (userName.toLowerCase().indexOf(filter) > -1) {
                rows[i].style.display = "";
            } else {
                rows[i].style.display = "none"; 
            }
        }
    }
}



function fetchUsers() {
    fetch('http://localhost:8080/api/list',{
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
        .then(users => {
            const userTableBody = document.getElementById('userTableBody');
            userTableBody.innerHTML = '';

            const filteredUsers = users.filter(user => user.name.toLowerCase());

            filteredUsers.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                `;
                userTableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Erro ao buscar usuários:', error));
}
window.onload = fetchUsers;
window.filterTable = filterTable;
