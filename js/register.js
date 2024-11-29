
document    
  .getElementById("registerForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const email = document.getElementById("emailCreate").value;
    const name = document.getElementById("nameCreate").value;
    const fullname = document.getElementById("nameCreate").value;
    const birthDate = document.getElementById("birthdayCreate").value;
    const gender = document.getElementById("gender").value;
    //billingAddress
    const zipCode = document.getElementById("cep").value;
    const addressType = document.getElementById("tipologradouro").value;
    const address = document.getElementById("logradouro").value;
    const number = document.getElementById("numero").value;
    const complement = document.getElementById("complemento").value;
    const neighborhood = document.getElementById("bairro").value;
    const city = document.getElementById("cidade").value;
    const state = document.getElementById("uf").value;
    //deliveryAddress
    const apelidoDelivery = document.getElementById("apelidoDelivery").value;
    const zipCodeDelivery = document.getElementById("cepDelivery").value;
    const addressTypeDelivery = document.getElementById("tipologradouroDelivery").value;
    const addressDelivery = document.getElementById("logradouroDelivery").value;
    const numberDelivery = document.getElementById("numeroDelivery").value;
    const complementDelivery = document.getElementById("complementoDelivery").value;
    const neighborhoodDelivery = document.getElementById("bairroDelivery").value;
    const cityDelivery = document.getElementById("cidadeDelivery").value;
    const stateDelivery = document.getElementById("ufDelivery").value;
    // dados de contato
    const phone1 = document.getElementById("phoneCreate").value;
    const phone2 = document.getElementById("phone2Create").value || ""; // campo opcional
    const CPF = document.getElementById("cpfCreate").value;
    const password = document.getElementById("passCreate").value;
    const passCreateRepeat = document.getElementById("passCreateRepeat").value;
    const passwordError = document.getElementById('passwordError');

    const nameError = document.getElementById('nameError');
    const nameValue = fullname.trim();
    // Divide o nome em palavras
    const words = nameValue.split(/\s+/);
    // Verifica se há pelo menos 2 palavras
    if (words.length < 2) {
        nameError.textContent = 'Por favor, insira seu nome e sobrenome.';
        document.getElementById("nameCreate").focus();
        return;
    }
    // Verifica se cada palavra tem pelo menos 3 letras
    const valid = words.every(word => word.length >= 3);
    if (!valid) {
        document.getElementById("nameCreate").focus();
        nameError.textContent = 'Cada palavra deve ter pelo menos 3 letras.';
        return;
    }
    // Limpa a mensagem de erro se a validação for bem-sucedida
    nameError.textContent = '';

    if (password !== passCreateRepeat) {
        document.getElementById("passCreateRepeat").focus();
        passwordError.textContent = 'As senhas não são iguais. Por favor, tente novamente.';
        return;
    } else {
        passwordError.textContent = '';
    }


    fetch("http://localhost:8080/customer/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document: CPF,
        fullname: fullname,
        customerType: "F", // Pode ser ajustado conforme necessário
        birthDate: birthDate,
        gender: gender,
        phone1: phone1,
        phone2: phone2,
        userDto: {
          name: name,
          email: email,
          password: password,
        },
        billingAddressDto: {
          nickname: "Faturamento", // Padrão ou conforme preenchido pelo usuário
          zipCode: zipCode,
          addressType: addressType, // Pode ser ajustado conforme necessário
          address: address,
          number: number,
          complement: complement,
          neighborhood: neighborhood,
          city: city,
          state: state,
        },
        deliveryAddressDto: {
          nickname: apelidoDelivery,
          zipCode: zipCodeDelivery,
          addressType: addressTypeDelivery,
          address: addressDelivery,
          number: numberDelivery,
          complement: complementDelivery,
          neighborhood: neighborhoodDelivery,
          city: cityDelivery,
          state: stateDelivery,
        },
      }),
    })
      .then((response) => {
        // Diferente 200
        if (!response.ok) {
            console.log(response.error);
            Swal.fire({
                title: "Erro!",
                text: "CPF ou Email em utilização!",
                icon: "error",
            });
        }

        // Extraia o JSON da resposta
        return response.json();
      })

      .then((data) => {
        //window.location.href = "../login.html";
        console.log(data);
        msgCadastroRealizado();
      })
      .catch((error) => {
        console.error("Erro ao fazer login:", error);
      });
  });

  function msgCadastroRealizado(){
    
    const url = new URL(window.location.href);
    const ReturnUrl = url.searchParams.get('ReturnUrl');

    Swal.fire({
        text: "Cadastro realizado com sucesso!",
        icon: "success",
        confirmButtonText: "OK"
    }).then((result) => {
        if (result.isConfirmed) {
            if (ReturnUrl) {
                window.location.href = `../login.html?ReturnUrl=`+ ReturnUrl;
            } else {
                window.location.href = `../login.html`;
            }
            
        }
    });
}

function permitirSomenteNumeros(event) {
    let input = event.target.value;
    input = input.replace(/\D/g, ''); 
    event.target.value = input;
}

document.getElementById('cpfCreate').addEventListener('input', permitirSomenteNumeros);

function aplicarMascaraData(event) {
    let input = event.target.value.replace(/\D/g, ''); 

    if (input.length <= 2) {
        input = input;
    } else if (input.length <= 4) {
        input = input.substring(0, 2) + '/' + input.substring(2, 4);
    } else {
        input = input.substring(0, 2) + '/' + input.substring(2, 4) + '/' + input.substring(4, 8);
    }

    event.target.value = input;
}

document.getElementById('birthdayCreate').addEventListener('input', aplicarMascaraData);

function aplicarMascaraCEP(event) {
    let input = event.target.value.replace(/\D/g, ''); 

    if (input.length > 5) {
        input = input.substring(0, 5) + '-' + input.substring(5, 8);
    }

    event.target.value = input;
}

document.getElementById('cep').addEventListener('input', aplicarMascaraCEP);
document.getElementById('cepDelivery').addEventListener('input', aplicarMascaraCEP);