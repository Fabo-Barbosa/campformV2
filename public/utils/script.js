// elementos Constantes 
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggleBtn');
const eyeIcon = document.getElementById('eyeIcon');


// Inicialização do popover (Bootstrap 5)
var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl, {
      trigger: 'focus' // O popover some quando clicar fora
    })
})

if (toggleBtn){
    toggleBtn.addEventListener('click', function() {
        // Alterna o tipo do input
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Alterna o ícone
        if (eyeIcon.classList[0] == "close") {
            eyeIcon.classList.remove("close");
            eyeIcon.classList.add("open");
            eyeIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#434343"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>';
        } else {
            eyeIcon.classList.add("close");
            eyeIcon.classList.remove("open");
            eyeIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#434343"><path d="M0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0zm0 0h24v24H0z" fill="none"/><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
        }
    });
}

function verifyPassword() {
    const passwordInput = document.getElementById('inputPassword');
    const registerBtn = document.getElementById('btnRegister');
    const minLength = 8;
    
    // Inicializa o popover (necessário no Bootstrap para ativar o gatilho)
    //$(passwordInput).popover('show');

    // Seleciona o corpo do popover que está renderizado no DOM
    const popoverBody = document.querySelector('.popover-body');

    if (passwordInput.value.length >= minLength) {
        // Requisito satisfeito
        if (popoverBody) {
            popoverBody.style.color = 'green';
        }
        
        // Estilização do botão de registro
        registerBtn.removeAttribute('disabled');

    } else {
        // Requisito não satisfeito
        if (popoverBody) {
            popoverBody.style.color = 'red';
        }
        
        // Bloqueia o botão
        registerBtn.setAttribute('disabled', '');

    }
}