// myLocalStorage.js
    export function setItemWithExpiry(key, value, ttl) {
        const now = new Date();

        // Cria um objeto com o valor e o tempo de expiração
        const item = {
            value: value,
            expiry: now.getTime() + ttl // ttl é o tempo de vida em milissegundos
        };

        // Armazena o objeto como uma string no localStorage
        localStorage.setItem(key, JSON.stringify(item));
    }

    export function getItemWithExpiry(key) {
        const itemStr = localStorage.getItem(key);
    
        // Se o item não existe, retorna null
        if (!itemStr) {
            return null;
        }
    
        // Converte de volta para um objeto
        const item = JSON.parse(itemStr);
        const now = new Date();
    
        // Verifica se o item já expirou
        //if (now.getTime() > item.expiry) {
        //    
        //    // Se o item expirou, remove-o do localStorage e retorna null
        //   localStorage.removeItem(key);
        //    return null;
        //}
    
        // Se o item não expirou, retorna o valor
        return item.value;
    }


    export function removeitem(key) {
        localStorage.removeItem(key);
    }
