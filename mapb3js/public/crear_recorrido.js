
var archivos=[];  //arreglo de objetos de imagenes cargadas
var ImagesUrlObject= []; //arreglo de urls de panoramas
var panoramaA= []; //arreglo  de panoramas
var selected_icon; //icono seleccionado
var hotspot_image_url = "assets/arrow-up.png"; //imagen del hotspot
var infospot_image_url = "assets/information.png"; //imagen del hotspot
var panoImage; // contenedor del viewer
var panorama ;  //contiene al objetos panorma
var viewer; //contiene al objeto viewer
var ejes_xyz; // contiene los ejes xyz del raycast
var btn_EstadoInfospot=false; //estado de activacion del btn
var btn_EstadoHotspot=false; //estado de activacion del btn
var btn_Eliminarspot=false; //estado de activacion del btn
var panoramaActual; // panorama actual del viewer
var panoActualHotspot; //imagen actual de conexion para el hotspot 
var clickedPos2 ; //postion hotspot
var panohotspot;  //panorama en el que se pondra el hotspot
var array_scenes =[]; // arreglo de scenes (panormas, infospot y hotspots) para el JSON
var infospotsA= []; //arreglo de infospots
var hotspotsA= []; //arreglo de hotspots
var nombre_recorrido;
var jsonString;
var id_rec;


document.getElementById("btn_camb_hotspot").addEventListener("click",camb_icono_hotspot);
document.getElementById("btn_camb_infospot").addEventListener("click", camb_icono_infospot);
document.getElementById("btn_usar_conf_hot").addEventListener("click", cerrar_conf_hot);
document.getElementById("btn_usar_conf_info").addEventListener("click", cerrar_conf_info);
document.getElementById("btn_usar_conf").addEventListener("click", cerrar_conf);
document.getElementById("btn_link").addEventListener("click", mostrar_link);
document.getElementById("btn_iframe").addEventListener("click", mostrar_iframe);
document.getElementById("btn_cerrar_link").addEventListener("click", cerrar_link);
document.getElementById("btn_cerrar_iframe").addEventListener("click", cerrar_iframe);
const lista =document.querySelectorAll(".icono_caja");
for (let i = 0; i < lista.length; i++) {
  lista[i].addEventListener("click",select_icon);
};
document.getElementById("btn_infospot").addEventListener("click", crearInfospot);
document.getElementById("btn_hotspot").addEventListener("click", crearHotspot);
document.getElementById("btn_eliminar").addEventListener("click", activar_evento_eliminar);
document.getElementById("btn_next").addEventListener("click", NextPano);
document.getElementById("btn_last").addEventListener("click", LastPano);
document.getElementById("btn_seleccionar").addEventListener("click",SelectImgHotSpot);
document.getElementById("btn_cancelar").addEventListener("click",cancelar_conexion);
document.getElementById("btn_last_pano").addEventListener("click", LastPanoHotspot );
document.getElementById("btn_next_pano").addEventListener("click", NextPanoHotspot);
document.getElementById("btn_guardar").addEventListener("click", generarJSONfile);
document.getElementById("btn_camera").addEventListener("click",camera_hotspot);
document.getElementById("btn_select_image").addEventListener("click",definir_primer_panorama);
document.getElementById("btn_last_image").addEventListener("click", LastPanoImage );
document.getElementById("btn_next_image").addEventListener("click", NextPanoImage);
document.getElementById("conf_spot").style.display="block"; //muestra la ventana de seleccionar imagen

document.getElementById("progress").style.display="none";
inhabilitar_btn();

//constructor de objeto 
function coordenada (x,y,z){
  this.x=x;
  this.y=y;
  this.z=z;
}
//constructor de objeto 
function hotspot (id,coordenadaP,coordenadaR){
  this.id=id;
  this.coordenadaP=coordenadaP;
  this.coordenadaR=coordenadaR;
}
//constructor de objeto 
function infospot (coordenadaP,info){
  this.coordenadaP=coordenadaP;
  this.info=info;    
}
//constructor de objeto 
function scene (id,src,infospot=[],hotspot=[]){
  this.id=id;
  this.src=src;
  this.infospot=infospot;
  this.hotspot=hotspot;
}
function recorrido (scene=[],icon_hotspot,icon_infospot,cliente,nombre){
  this.scene=scene;
  this.icon_hotspot=icon_hotspot;
  this.icon_infospot=icon_infospot;
  this.cliente=cliente;
  this.nombre=nombre
}
// agrega un borde azul al icono seleccionado
function select_icon(){
  selected_icon=(this.firstElementChild.src);
  for (let i = 0; i < lista.length; i++) {
    lista[i].style.borderColor="black";
    this.style.borderColor="blue";
  };
}
//muestra la ventana cam icono hotspot
function camb_icono_hotspot(){
  document.getElementById("conf_hotspot").style.display="block"; //muestra la ventana de seleccionar imagen
}
//muestra la ventana cam icono infospot
function camb_icono_infospot(){
  document.getElementById("conf_infospot").style.display="block"; //muestra la ventana de seleccionar imagen
}
//cierra la ventana de conf de hotspots
function cerrar_conf_hot(){
  document.getElementById("conf_hotspot").style.display="none";
  for (let i = 0; i < lista.length; i++) {
    lista[i].style.borderColor="black";
  }; 
  if(selected_icon!=undefined){
    hotspot_image_url=selected_icon;
    document.getElementById("icon_hot").src=(hotspot_image_url);
    selected_icon=undefined;
  }
}
//cierra la ventana de conf de infospots
function cerrar_conf_info(){
  document.getElementById("conf_infospot").style.display="none"; 
  for (let i = 0; i < lista.length; i++) {
    lista[i].style.borderColor="black";
  };
  if(selected_icon!=undefined){
    infospot_image_url=selected_icon;
    document.getElementById("icon_info").src=(infospot_image_url);
    selected_icon=undefined;
  }
}
//cierra la ventana de conf de iconos
function cerrar_conf(){
  document.querySelector("#p_consejo").innerHTML="Cargue las imágnes deseadas *Se recomienda usar imagenes de dimensiones de 2880x1440 o menor*";
  document.getElementById("conf_spot").style.display="none";
  document.querySelector(".cont_iconos_usados").style.display="block";
  document.getElementById("icono_usado_hot").src=(hotspot_image_url);
  document.getElementById("icono_usado_info").src=(infospot_image_url);
}
//carga las imagenes como blobs en 64 y las mete en arreglos, 
//carga la informacion de las imagenes como objetos y los mete en un arreglo
document.querySelector("#image_input").addEventListener("change", function () {
  for(let i=0; i<this.files.length;i++){
    archivos[i]=this.files[i];
    ImagesUrlObject[i]=URL.createObjectURL(this.files[i]); //genera las url de los archivos subidos
    console.log("archivo "+ archivos[i].name + " subido en la url : "+ImagesUrlObject[i]);
  }
  panoActualHotspot=0;
  document.querySelector("#select_first_pano").style.display="block";
  document.getElementById("img_select").src=ImagesUrlObject[0];
});


function onProgressUpdate ( event ) {
  var percentage = event.progress.loaded/ event.progress.total * 100;
  bar.style.width = percentage + "%";
  if (percentage >= 100){
    bar.classList.add( 'hide' );
    setTimeout(function(){
      bar.style.width = 0;
    }, 1000);
  }
}

// document.querySelector("#image_input2").addEventListener("change", function () {
//   var newImagesUrlObject=[] ;
  
//   for(let i=0; i<this.files.length;i++){
//     archivos.push(this.files[i]);
//     newImagesUrlObject[i]=URL.createObjectURL(this.files[i]);
//     ImagesUrlObject.push(newImagesUrlObject[i]);
//     console.log("---nuevo archivo subido en la url : "+newImagesUrlObject[i]);
//     console.log(archivos)

//     let array_info=[]; //arreglo de objetos infospot
//     let array_hot=[]; // arreglo de objetos hotspot
//     const id = (archivos.length)-1;
//     var src = this.files[i].name;
//     // var src = "/public/recorridos/"+this.files[i].name;
//     var sce =new scene (id,src,array_info,array_hot);
//     array_scenes.push(sce);

//     console.log(array_scenes)
//   }
//   for(let e=0; e<newImagesUrlObject.length;e++){
//     crear_panoramas(newImagesUrlObject[e]);
//   }
//   document.getElementById("form_img2").submit(); //sube las imagenes
//   document.getElementById("number_img").innerHTML = (panoramaActual+1)+" / "+(panoramaA.length);
// });


//cambia a la imagen siguiente de las imagenes icialmente cargadas
function NextPanoImage(){
  if(ImagesUrlObject[panoActualHotspot+1]!=undefined){
  document.getElementById("img_select").src=ImagesUrlObject[panoActualHotspot+1];
  panoActualHotspot++;}
}
//cambia la imagen anterior de las imagenes icialmente cargadas
function LastPanoImage(){
  if(ImagesUrlObject[panoActualHotspot-1]!=undefined){
  document.getElementById("img_select").src=ImagesUrlObject[panoActualHotspot-1];
  panoActualHotspot--;}
}
//define la primera imagen del recorrido entre las imagenes cargadas
function definir_primer_panorama(){
  let archivo_temp =archivos[0];
  archivos[0]=archivos[panoActualHotspot];
  archivos[panoActualHotspot]=archivo_temp;
  archivo_temp=ImagesUrlObject[0];
  ImagesUrlObject[0]=ImagesUrlObject[panoActualHotspot];
  ImagesUrlObject[panoActualHotspot]=archivo_temp;
  visualizar_panoramas();
  document.querySelector("#select_first_pano").style.display="none";
  panoActualHotspot=0;
}
//llama a crear el viewer los panoramas, los objetos scene y define la imagen preview del primer panorama
function visualizar_panoramas(){
  document.querySelector(".image-preview").style.display = "block";
  document.querySelector(".image-preview").setAttribute("src", ImagesUrlObject[0]);  
  document.getElementById("name_img").innerHTML = archivos[0].name;
  
  panoImage=document.querySelector("#tour_panolens");
  crear_viewer();
  
  for(let e=0; e<ImagesUrlObject.length;e++){
    crear_panoramas(ImagesUrlObject[e]);
  }
  document.querySelector("#btn_agregar_img").style.display="none";
  panoramaActual=0;
  document.getElementById("number_img").innerHTML = (panoramaActual+1)+" / "+(panoramaA.length);
  GenerateScenes();
  habilitar_btn();
  document.querySelector("#p_consejo").innerHTML="Ingrese los hotspot o infospots del recorrido";
  document.getElementById("progress").style.display="block";
}
//crea el primer panorama y el viewer
function crear_viewer() {
  viewer = new PANOLENS.Viewer({  // se crea el viewer
    container: panoImage,
    controlBar: true, // Vsibility of bottom control bar
    controlButtons: ["fullscreen"], // Buttons array in the control bar. Default to ['fullscreen', 'setting', 'video']
    autoHideControlBar: false, // Auto hide control bar
    autoHideInfospot: false, // Auto hide infospots
    horizontalView: false, // Allow only horizontal camera control
    cameraFov: 70, // zoom
    reverseDragging: false, // Reverse orbit control direction
    enableReticle: false, // Enable reticle for mouseless interaction
    dwellTime: 1500, // Dwell time for reticle selection in millisecond
    autoReticleSelect: false, // Auto select a clickable target after dwellTime
    viewIndicator: false, // Adds an angle view indicator in upper left corner
    indicatorSize: 90, // Size of View Indicator
    output: "console", // Whether and where to output infospot position. Could be 'console' or 'overlay'
    autoRotate: false, 
    autoRotateSpeed: 0.5, 
    autoRotateActivationDuration: 8000
  });
  // viewer.OrbitControls.noZoom = true;
}
//crea todos los panormas en el viewer
function crear_panoramas(imagen){
  panorama = new PANOLENS.ImagePanorama(imagen); // se genera panorama un objeto imagePanorama
  panorama.addEventListener( 'progress', onProgressUpdate );
  viewer.add(panorama);
  panoramaA.push(panorama);
}
//genera los objetos secenes por cada archivo subido
function GenerateScenes (){
  for (let i = 0; i < archivos.length; i++) {
    let array_info=[]; //arreglo de objetos infospot
    let array_hot=[]; // arreglo de objetos hotspot
    const id = i;
    var src = archivos[i].name;
    var sce =new scene (id,src,array_info,array_hot);
    array_scenes.push(sce);
    // console.log(sce); 
  }
}
// cambia al siguiente panorama 
function NextPano(){
  if ( (panoramaA[panoramaActual+1])!=undefined) {
    bar.classList.remove( 'hide' );
    panoramaActual=panoramaActual+1;
    viewer.setPanorama( panoramaA[panoramaActual] );
    document.querySelector("#p_consejo").innerHTML="Ingrese los hotspot o infospots del recorrido";
    cambiar_image_preview();
    document.getElementById("number_img").innerHTML = (panoramaActual+1)+" / "+(panoramaA.length);
  }
}
// cambia al panorama anterior 
function LastPano(){
  if ((panoramaA[panoramaActual-1])!=undefined) {
    bar.classList.remove( 'hide' );
    panoramaActual=panoramaActual-1;
    viewer.setPanorama( panoramaA[panoramaActual] );
    document.querySelector("#p_consejo").innerHTML="Ingrese los hotspot o infospots del recorrido";
    cambiar_image_preview();
    document.getElementById("number_img").innerHTML = (panoramaActual+1)+" / "+(panoramaA.length);
  }
}
// obtiene el panorama actual
function ObtenerPanoramaActual (){
  return panoramaA[panoramaActual];
}
//desactiva los botones del infospot, hotspot y eliminar
//remueve los eventos activos
function DesactivarBotones (){
  ObtenerPanoramaActual().removeEventListener("click",EventclikInfospot);
  ObtenerPanoramaActual().removeEventListener("click",EventclikHotspot);
  for (let index = 0; index < panoramaA[panoramaActual].children.length; index++) {
    panoramaA[panoramaActual].children[index].removeEventListener("click", eliminar_spot);
  }
  document.getElementById("btn_hotspot").className = "btn";
  document.getElementById("btn_infospot").className = "btn";
  document.getElementById("btn_eliminar").className = "btn";
  btn_EstadoHotspot=false;
  btn_Eliminarspot=false;
  btn_EstadoInfospot=false;
  document.getElementById("btn_infospot").disabled = false;
  document.getElementById("btn_eliminar").disabled = false;
  document.getElementById("btn_hotspot").disabled = false;
}
//activa el evento agregar infospots por clik o lo desactiva
function crearInfospot () {
  if(btn_EstadoInfospot==false){
    document.querySelector("#p_consejo").innerHTML="Elija un lugar del recorrido para generar el infospot";
    ObtenerPanoramaActual().addEventListener('click',EventclikInfospot)
    btn_EstadoInfospot=true;
    document.getElementById("btn_hotspot").disabled = true;
    document.getElementById("btn_eliminar").disabled = true;
    document.getElementById("btn_hotspot").className = "btnDesactivado";
    document.getElementById("btn_eliminar").className = "btnDesactivado";
    document.getElementById("btn_infospot").className = "btnActivado";
  }else{
    document.querySelector("#p_consejo").innerHTML="Ingrese los hotspot o infospots del recorrido";
    ObtenerPanoramaActual().removeEventListener("click",EventclikInfospot);
    btn_EstadoInfospot=false;
    document.getElementById("btn_hotspot").disabled = false;
    document.getElementById("btn_eliminar").disabled = false;
    document.getElementById("btn_hotspot").className = "btn";
    document.getElementById("btn_infospot").className = "btn";
    document.getElementById("btn_eliminar").className = "btn";
  }
}
//agrega el infospot
//genera el objeto infospot y lo mete en el array de infospots del objeto scene
function EventclikInfospot(event){
  if(isHovering(infospotsA)){
    return;
  }else {
    var txt=Input_texto();
    if(txt!="" && txt!=null){
      let myInfospot = new PANOLENS.Infospot(450, infospot_image_url, animated=true); //parametro 1 tamaño 
      let clickedPos = GetPosition();
      let xyz_obj= new coordenada(-(clickedPos.x),(clickedPos.y),(clickedPos.z));
      myInfospot.position.set(-(clickedPos.x),(clickedPos.y),(clickedPos.z));
      myInfospot.addHoverText(txt,55); //parametro 2 espaciado del texto con la imagen
      ObtenerPanoramaActual().add(myInfospot);
      ObtenerPanoramaActual().toggleInfospotVisibility(true,100); // parametro 2 tiempo de aparicion
      let info_obj =new infospot(xyz_obj,txt);
      array_scenes[panoramaActual].infospot.push(info_obj);
      // console.log(array_scenes);
    }
  }
}
//prompt para recibir texto del infospot
function Input_texto (){
  let text = prompt("Escriba el texto del infospot");
  return text;
}
//activa el evento de agregar hotspots por clik o lo desactiva
function crearHotspot () {
  if(btn_EstadoHotspot==false){
    document.querySelector("#p_consejo").innerHTML="Elija un lugar del recorrido para generar el hotspot";
    ObtenerPanoramaActual().addEventListener('click',EventclikHotspot)
    btn_EstadoHotspot=true;
    document.getElementById("btn_infospot").disabled = true;
    document.getElementById("btn_eliminar").disabled = true;
    document.getElementById("btn_infospot").className = "btnDesactivado";
    document.getElementById("btn_eliminar").className = "btnDesactivado";
    document.getElementById("btn_hotspot").className = "btnActivado";
  }else{
    document.querySelector("#p_consejo").innerHTML="Ingrese los hotspot o infospots del recorrido";
    ObtenerPanoramaActual().removeEventListener("click",EventclikHotspot);
    btn_EstadoHotspot=false;
    document.getElementById("btn_infospot").disabled = false;
    document.getElementById("btn_eliminar").disabled = false;
    document.getElementById("btn_infospot").className = "btn";
    document.getElementById("btn_hotspot").className = "btn";
    document.getElementById("btn_eliminar").className = "btn";
  }
}
//cancela la accion de mostrar las imagenes a conectar en el hotspot
function cancelar_conexion(){
  document.getElementById("select_pano").style.display="none"; //muestra la ventana de seleccionar imagen
  habilitar_btn();
  crearHotspot();// habilita nuevamente el crear hotspot event
}
//agrega el hotspot
function EventclikHotspot(event){
  if(isHovering(hotspotsA)){
    return;
  }else {
    panoActualHotspot=0;
    DesactivarBotones();
    inhabilitar_btn();
    document.getElementById("select_pano").style.display="block"; //muestra la ventana de seleccionar imagen
    document.getElementById("img_select_spot").src=ImagesUrlObject[0];
    document.getElementById("number_img_hotspot").innerHTML = (panoActualHotspot+1)+" / "+(panoramaA.length);
    document.getElementById("name_img_hotspot").innerHTML =archivos[panoActualHotspot].name
    clickedPos2 = GetPosition();
    panohotspot= panoramaActual; //variable que recuerda numero del panorma donde esta el hotspot
  }
}
//genera el objeto de hotspot y lo mete en el panorama
//genera el objeto hotspot y lo mete en el array de hotspot del objeto scene
function camera_hotspot(){
  document.querySelector("#p_consejo").innerHTML="Ingrese los hotspot o infospots del recorrido";
  document.querySelector(".panolens-canvas").style.padding="0%"; 
  // panoramaA[0].link( panoramaA[2], new THREE.Vector3(126.94, 1312.17, 4814.32),[300],[PANOLENS.DataImage.infospot] );
  let myHotspot = new PANOLENS.Infospot(800, hotspot_image_url, animated=true);
  let xyz_position= new coordenada(-(clickedPos2.x),(clickedPos2.y),(clickedPos2.z));
  myHotspot.position.set(-(clickedPos2.x),(clickedPos2.y),(clickedPos2.z));
  myHotspot.addHoverText(("Img: "+archivos[panoActualHotspot].name),55);
  panoramaA[panohotspot].add(myHotspot);
  panoramaA[panohotspot].toggleInfospotVisibility(true,200);
  let xyz_obj_camera=GetPosition();
  let hot_obj =new hotspot(panoActualHotspot,xyz_position,xyz_obj_camera);
  // console.log(array_scenes);
  array_scenes[panohotspot].hotspot.push(hot_obj);
  // console.log(array_scenes);
  document.getElementById("btn_camera").style.display="none";
  habilitar_btn();
  panoramaActual=panohotspot;
  viewer.setPanorama( panoramaA[panoramaActual] );
  cambiar_image_preview();
  //setear la camara al lugar original del hotspot
  const cameraLookAt = new THREE.Vector3(
    (-(clickedPos2.x)), ///***se agregó un menos para quitar el menos que se usa en panolens(en el vector de 3js no se usa)****/
    (clickedPos2.y),
    (clickedPos2.z)
  );
  viewer.tweenControlCenter(cameraLookAt, 0);
  crearHotspot();
}
//dasactiva todos los botones menos salir y set camera
function inhabilitar_btn(){
  document.getElementById("btn_infospot").disabled = true;
  document.getElementById("btn_hotspot").disabled = true;
  document.getElementById("btn_next").disabled = true;
  document.getElementById("btn_last").disabled = true;
  document.getElementById("btn_guardar").disabled = true;
  document.getElementById("btn_eliminar").disabled = true;
}
//activa todos los botones 
function habilitar_btn(){
  document.getElementById("btn_infospot").disabled = false;
  document.getElementById("btn_hotspot").disabled = false;
  document.getElementById("btn_next").disabled = false;
  document.getElementById("btn_last").disabled = false;
  document.getElementById("btn_guardar").disabled = false;
  document.getElementById("btn_eliminar").disabled = false;
}
//permite elegir la rotacion de camara para el hotspot
function SelectImgHotSpot(){ 
  if(panoramaActual!=panoActualHotspot){
    document.querySelector("#p_consejo").innerHTML="Defina la posición que tendra la cámara al usar el hotspot";
    inhabilitar_btn();
    document.querySelector(".panolens-canvas").style.padding="3%"; 
    document.getElementById("select_pano").style.display="none";
    viewer.setPanorama( panoramaA[panoActualHotspot] );
    panoramaActual= panoActualHotspot;
    document.querySelector(".image-preview").setAttribute("src", ImagesUrlObject[panoramaActual]);  
    document.getElementById("name_img").innerHTML = archivos[panoramaActual].name;
    document.getElementById("number_img").innerHTML = (panoramaActual+1)+" / "+(panoramaA.length);
    document.getElementById("btn_camera").style.display="block";
  }else if(panoramaActual==panoActualHotspot){
    window.alert("No se puede usar la misma imagen a conectar")
  }
}

//llena el dropdown con los nombres de las imágenes y un div que los contenga
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
  if(document.getElementById("myDropdown").lastElementChild){
  }else{
    let newElement = document.createElement("div");
    document.getElementById("myDropdown").appendChild(newElement);
    newElement.className="cajon_nom_img";
    for (let index = 0; index < archivos.length; index++) {
      let newElement2 = document.createElement("a");
      if(archivos[index].name){
        newElement2.innerHTML=archivos[index].name;
      }else{
        const new_name = (archivos[index].replace('/public/recorridos/'+id_rec+'/',''));
        newElement2.innerHTML=new_name;
      }
      newElement2.value=index;
      newElement2.addEventListener("click",change_img_with_value);
      newElement.appendChild(newElement2);
    }
  }
}
//cambia la imagen segun el valor del elemento dropdown
function change_img_with_value(){
  // console.log(this.value);
    panoActualHotspot=this.value;
    document.getElementById("img_select_spot").src=ImagesUrlObject[panoActualHotspot];
    document.getElementById("number_img_hotspot").innerHTML = (panoActualHotspot+1)+" / "+(panoramaA.length);
    if(archivos[panoActualHotspot].name){//comprueba si es un objeto con nombre o un string obtneido del recorrido guardado
      document.getElementById("name_img_hotspot").innerHTML = archivos[panoActualHotspot].name;
    }else{
      const new_name = (archivos[panoActualHotspot].replace('/public/recorridos/'+id_rec+'/',''));
      document.getElementById("name_img_hotspot").innerHTML =new_name;
    }
}
// cierra el dropdown y elimina sus hijos
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        var e = document.querySelector("#myDropdown");
          var child = e.lastElementChild; 
            while (child) {
                e.removeChild(child);
                child = e.lastElementChild;
                // console.log("hijo removido del div")
            }
        openDropdown.classList.remove('show');
      }
    }
  }
}
//cambia la imagen y texto del preview del panorma y desactiva los botones
function cambiar_image_preview (){
  document.querySelector(".image-preview").setAttribute("src", ImagesUrlObject[panoramaActual]); 
  document.getElementById("name_img").innerHTML = archivos[panoramaActual].name;
  document.getElementById("number_img").innerHTML = (panoramaActual+1)+" / "+(panoramaA.length);
  DesactivarBotones();
}
//cambia el priview de la imagen a conectar en el hotspot
function NextPanoHotspot(){
  if(ImagesUrlObject[panoActualHotspot+1]!=undefined){
  document.getElementById("img_select_spot").src=ImagesUrlObject[panoActualHotspot+1];
  panoActualHotspot++;
  document.getElementById("number_img_hotspot").innerHTML = (panoActualHotspot+1)+" / "+(panoramaA.length);
  document.getElementById("name_img_hotspot").innerHTML =archivos[panoActualHotspot].name
  }
}
//cambia el priview de la imagen a conectar en el hotspot
function LastPanoHotspot(){
  if(ImagesUrlObject[panoActualHotspot-1]!=undefined){
  document.getElementById("img_select_spot").src=ImagesUrlObject[panoActualHotspot-1];
  panoActualHotspot--;
  document.getElementById("number_img_hotspot").innerHTML = (panoActualHotspot+1)+" / "+(panoramaA.length);
  document.getElementById("name_img_hotspot").innerHTML =archivos[panoActualHotspot].name
  }
}
//bucle de agregar los spots y reaccionar si hay otros hotspots en la posicion
function isHovering(spots){
  for (let i =0; i < spots.length; i++){
    if(spots[i].isHovering){
      console.log("ya hay un spot en este lugar");
      return true;
    } else {
      continue;
    }
  }
}
//obtiene la posicion de xyz en base al puntero o camara actual(ctrl+hovering en el viwer y consola tambien lo obtiene)
function GetPosition(){
  ejes_xyz=viewer.raycaster.intersectObject(viewer.panorama,true)[0].point;
  // console.log( ejes_xyz.x,ejes_xyz.y,ejes_xyz.z);
  return ejes_xyz;
}
//agrega un evento de eliminar a todos los spots hijos del panorma actual o elimina el evento
function activar_evento_eliminar(){
  if(btn_Eliminarspot==false){
    document.querySelector("#p_consejo").innerHTML="Seleccione un elemento del recorrido a eliminar";
    for (let index = 0; index < panoramaA[panoramaActual].children.length; index++) {
      panoramaA[panoramaActual].children[index].addEventListener("click", eliminar_spot);
    }
    document.getElementById("btn_hotspot").disabled = true;
    document.getElementById("btn_infospot").disabled = true;
    document.getElementById("btn_hotspot").className = "btnDesactivado";
    document.getElementById("btn_infospot").className = "btnDesactivado";
    document.getElementById("btn_eliminar").className = "btnActivado";
    btn_Eliminarspot=true;
  }else{
    document.querySelector("#p_consejo").innerHTML="Ingrese los hotspot o infospots del recorrido";
    for (let index = 0; index < panoramaA[panoramaActual].children.length; index++) {
      panoramaA[panoramaActual].children[index].removeEventListener("click", eliminar_spot);
    }
    btn_Eliminarspot=false;
    document.getElementById("btn_hotspot").disabled = false;
    document.getElementById("btn_infospot").disabled = false;
    document.getElementById("btn_hotspot").className = "btn";
    document.getElementById("btn_infospot").className = "btn";
    document.getElementById("btn_eliminar").className = "btn";
  }
}
//elimina el spot del panorama
//busca en el arreglo de objetos infospots el mismo infospot con la poscion del ifospot borrado para eliminarlo
//busca en el arreglo de objetos hotspots el mismo hotspot con la poscion del hotspot borrado para eliminarlo
function eliminar_spot(){
  let pos=this.position;
  let seguir_busc=true;
  for (let i = 0; i < (array_scenes[panoramaActual].infospot).length; i++) {
    if(pos.x==array_scenes[panoramaActual].infospot[i].coordenadaP.x 
      && pos.y==array_scenes[panoramaActual].infospot[i].coordenadaP.y
      && pos.z==array_scenes[panoramaActual].infospot[i].coordenadaP.z){
      array_scenes[panoramaActual].infospot.splice(i,1);
      console.log("elemento borrado:");
      console.log(array_scenes[panoramaActual].infospot);
      seguir_busc=false;
    }
  }
  if(seguir_busc==true){
    for (let i = 0; i < (array_scenes[panoramaActual].hotspot).length; i++) {
      if(pos.x==array_scenes[panoramaActual].hotspot[i].coordenadaP.x 
        && pos.y==array_scenes[panoramaActual].hotspot[i].coordenadaP.y  
        && pos.z==array_scenes[panoramaActual].hotspot[i].coordenadaP.z ){
        array_scenes[panoramaActual].hotspot.splice(i,1);
        console.log("elemento borrado:");
        console.log(array_scenes[panoramaActual].hotspot);
      }
    }
  }
  this.dispose();
}
// escribe y gnera el JSON con los datos del scenes array
//muestra el mensaje de exito
async function generarJSONfile (){
  DesactivarBotones();
  
  let nombre_cliente = prompt("Escriba el nombre del cliente");
  if(nombre_cliente!="" && nombre_cliente!=null){
    let iconH;
    if(hotspot_image_url.indexOf("arrow-up")!== -1){
      iconH=1;
    }
    else if(hotspot_image_url.indexOf("spot")!== -1){
      iconH=2;
    }else if(hotspot_image_url.indexOf("negro")!== -1){
      iconH=3;
    }
    else if(hotspot_image_url.indexOf("logo")!== -1){
      iconH=4;
    }
    let iconI;
    if(infospot_image_url.indexOf("information")!== -1){
      iconI=1;
    }
    else if(infospot_image_url.indexOf("gris")!== -1){
      iconI=2;
    }else if(infospot_image_url.indexOf("inf-negro")!== -1){
      iconI=3;
    }
    else if(infospot_image_url.indexOf("logo")!== -1){
      iconI=4;
    }
    nombre_recorrido = prompt("Escriba el nombre del recorrido ");
    if(nombre_recorrido!="" && nombre_recorrido!=null){
      inhabilitar_btn();
      document.getElementById("estado_de_guardado").style.display="block";
      let recorridoO= new recorrido(array_scenes,iconH,iconI,nombre_cliente,nombre_recorrido);
      jsonString = JSON.stringify(Object.assign( recorridoO));
      console.log(jsonString);
      await guardar_json();
      // try{
      //   document.getElementById("form_imagenes").submit(); //sube las imagenes direccion multiple en el backend
      // } catch{
      //   window.alert("Error: No se pudieron subir las imagenes")
      // }
    }else if(nombre_recorrido==""){window.alert("Debe indicar un nombre")}
  }else if(nombre_cliente==""){window.alert("Debe indicar un nombre")}
}
function guardar_img(){
  const name = document.getElementById("name");
  const files = document.getElementById("image_input");
  const formData = new FormData();
  formData.append("name", id_rec);
  for(let i =0; i < files.files.length; i++) {
    formData.append("files", files.files[i]);
  }
  fetch('/multiple', {
    method: 'POST',
    body: formData  
  })
  .then((res) => res.text())
  .then((text) => {
    try{
    console.log(text);
    document.getElementById("guardado_exitoso").style.display="block";
    document.querySelector("#p_consejo").innerHTML="";
    document.getElementById("estado_de_guardado").style.display="none";
    }catch{
      window.alert("error al subir img")
      document.getElementById("estado_de_guardado").style.display="none"
      habilitar_btn();
    }
  }
  )
  

}
async function guardar_json(){
  fetch('/json_data', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({jsonString})
  })
  .then((response) => response.text())
  .then((text) => {
    text=JSON.parse(text);
    id_rec=text;
    document.getElementById("name").value=id_rec;
    if(text.length>=1){
      guardar_img();
      // document.getElementById('text_area_iframe').value=text;
      document.getElementById('text_area_link').value="http://localhost:3000/public/visualizador.html?id="+text;
    }else{
      window.alert("Error: No se pudieron guardar los datos del recorrido");
      document.getElementById("estado_de_guardado").style.display="none"
      habilitar_btn();
    }
  });
}
//muestra la pantalla del link
function mostrar_link(){
  document.getElementById("link_recorrido").style.display="block"; 
}
//muestra la pantalla del iframe
function mostrar_iframe(){
  document.getElementById("iframe_recorrido").style.display="block"; 
}
//cierra la pantalla del link
function cerrar_link(){
  document.getElementById("link_recorrido").style.display="none"; 
}
//cierra la pantalla del iframe
function cerrar_iframe(){
  document.getElementById("iframe_recorrido").style.display="none"; 
}