document.getElementById("btn_abrir_loguin").addEventListener("click",abrir_loguin);
document.getElementById("icono_cerrar").addEventListener("click",cerrar_loguin);


// function loguin (){
//    getElementById("usuario").value;
//    getElementById("password").value;
//     fetch('/loguin', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/x-www-form-urlencoded'},
//         body: new URLSearchParams({jsonString})
//     })
//     .then((response) => response.text())
//     .then((text) => {
        
//     })
// }

function abrir_loguin(){
document.getElementById('id01').style.display='block';
}

function cerrar_loguin(){
document.getElementById('id01').style.display='none'
}