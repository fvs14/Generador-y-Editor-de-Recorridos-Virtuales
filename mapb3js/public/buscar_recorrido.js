document.getElementById("btn_bus").addEventListener("click",buscar_rec_clientes);
document.getElementById('input_buscar').addEventListener("keypress", function(event){
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById('estado_bus').style.display="inline-block";
        document.getElementById('estado_bus').innerHTML="Buscando...";
        document.getElementById("btn_bus").click();
      }
})

listar_clientes();

function listar_clientes(){
    try{
        fetch('/get_clients', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((response) => response.text())
        .then((text) => {
        text=JSON.parse(text);
        // console.log(text);
        for (let index = 0; index < text.length; index++) {
            crear_elementos_cli(text[index]);
        };
        })
    }catch{
        window.alert("Error no se pudo obtener la lista de clientes");
    }
}
function buscar_rec_clientes(){
    const lista =document.querySelectorAll(".elemento");
        for (let i = 0; i < lista.length; i++) {
            lista[i].style.display="none";
        };
    document.getElementById('estado_bus').style.display="inline-block";
    document.getElementById('estado_bus').innerHTML="Buscando...";
    var text_bus=document.getElementById('input_buscar').value
    fetch('/search', {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({text_bus})
      })
      .then((response) => response.text())
      .then((text) => {
        // console.log(text);
        text=JSON.parse(text);
        if(text.length>=1){
            borrar_elementos();
            for (let index = 0; index < text.length; index++) {
                crear_elementos((text[index].nombre),(text[index].cliente),(text[index]._id));
            };
            document.getElementById('estado_bus').style.display="none";
            for (let i = 0; i < lista.length; i++) {
              lista[i].style.display="block";
            };
        }else{
            borrar_elementos();
            document.getElementById('estado_bus').innerHTML="No hay resultados";
        }
      });
}
function crear_elementos_cli(cli){
    let newElement = document.createElement("div");
    newElement.className="elemento";
    document.getElementById("espacio_cajon").appendChild(newElement);
    let newElement2 = document.createElement("h5");
    newElement2.className="elemento_titulo";
    newElement2.innerHTML="Cliente: "+cli;
    newElement.appendChild(newElement2);
}
function crear_elementos(nom,cli,id){
    let newElement = document.createElement("div");
    newElement.className="elemento";
    document.getElementById("espacio_cajon").appendChild(newElement);
    let newElement2 = document.createElement("h5");
    newElement2.className="elemento_titulo";
    newElement2.innerHTML="Nombre: "+nom+" / ";
    newElement.appendChild(newElement2);
    let newElement3 = document.createElement("h5");
    newElement3.className="elemento_titulo";
    newElement3.innerHTML="Cliente: "+cli+" / ";
    newElement.appendChild(newElement3);
    let newElement5 = document.createElement("a");
    newElement5.className="elemento_titulo";
    newElement5.innerHTML="http://localhost:3000/public/visualizador.html?id="+id;
    newElement5.href="http://localhost:3000/public/visualizador.html?id="+id;
    newElement.appendChild(newElement5);
    let newElement4 = document.createElement("a");
    newElement4.className="elemento_btn";
    newElement4.href="/editar?id="+id;
    newElement4.innerHTML="Editar";
    newElement.appendChild(newElement4);
    let newElement6 = document.createElement("a");
    newElement6.className="elemento_btn_eliminar";
    newElement6.innerHTML="Eliminar";
    newElement.appendChild(newElement6);
    newElement6.addEventListener("click",eliminar_rec);
    //-------este elemento esta escondido para el usario
    //debe estar despues del boton eliminar------------------
    let newElement0 = document.createElement("h5");
    newElement0.className="id_rec";
    newElement0.innerHTML=id;
    newElement.appendChild(newElement0);
}
function borrar_elementos() {
    var e = document.querySelector("#espacio_cajon");
     try{
    let child = e.lastElementChild; 
    while (child) {
        e.removeChild(child);
        child = e.lastElementChild;
    }
    }catch{
        console.log("no hay elementos por borrar")
    }
}
function eliminar_rec(){
    let result=window.confirm("¿Desea borrar este recorrido?");
    if(result){
        //obtine el elemento hermano que le siga
        let id_recorrido = this.nextElementSibling.innerHTML;
        // console.log(id_recorrido);
        fetch('/borrar', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({id_recorrido})
        })
        .then((response) => response.text())
        .then((text) => {
            text=JSON.parse(text);
            // console.log(text);
            if(text.acknowledged){
                window.alert("Recorrido eliminado");
                document.getElementById("btn_bus").click();
            }
        });
    }
} 