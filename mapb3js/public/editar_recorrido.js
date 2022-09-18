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
var infospotsA= []; //arreglo de infospots
var hotspotsA= []; //arreglo de hotspots
var array_scenes =[]; // arreglo de scenes (panormas, infospot y hotspots) para el JSON
var id_iconH;
var id_iconI;
var cliente;
var nombre;
var jsonString;

//consigue y tranforma los parametros enviados en la url a variable
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id_rec = urlParams.get('id');

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
document.getElementById("btn_guardar").addEventListener("click", abrir_conf_datos);
document.getElementById("btn_camera").addEventListener("click",camera_hotspot);
document.getElementById("btn_camb_hotspot").addEventListener("click",camb_icono_hotspot);
document.getElementById("btn_camb_infospot").addEventListener("click", camb_icono_infospot);
document.getElementById("btn_usar_conf_hot").addEventListener("click", cerrar_conf_hot);
document.getElementById("btn_usar_conf_info").addEventListener("click", cerrar_conf_info);
document.getElementById("btn_usar_conf").addEventListener("click", cerrar_conf);
document.getElementById("btn_usar_conf").addEventListener("click",abrir_conf_datos);
document.getElementById("btn_cam_icono").addEventListener("click",abrir_conf_spot);
document.getElementById("btn_editar_conf").addEventListener("click",generarJSONfile);
document.getElementById("btn_delete_pano").addEventListener("click",delete_pano);


inhabilitar_btn();
GenerateScenes();
buscar_recorrido();


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

//carga y genera el recorrido
async function buscar_recorrido(){
    await fetch('/obtner_rec', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({id_rec})
    })
    .then(async(response) => await response.text())
    .then(async(text)  =>  {
      
      text= JSON.parse(text);
      console.log(text);
      const panoramas =  createPanoramas(text); //array de objetos con atributos panoramas y ids
      const panoramasWithHotspots =  createHotspotActions(text, panoramas); //
      const panoramasWithInfospots =  createInfospotActions(text, panoramas); //
      // const scene =  createScene(panoramasWithHotspots);
      
    });
}
//crea los panoramas
  function createPanoramas(mapa) {
    const panoramas = [];
    mapa.scene.forEach((sceneO) => {
      //por cada contenido en el json(map) creo un objeto scene
      //saco los datos src y id de scene y los guarda en las constantes url y id
      const url = "/public/recorridos/"+id_rec+"/"+sceneO.src;
      const id = sceneO.id;
      //se crean objetos llamdos new panorama que usan url para crearse
      newPanorama = new PANOLENS.ImagePanorama(url);
      newPanorama.addEventListener( 'progress', onProgressUpdate );
      //mete en el array todos los objetos
      panoramas.push({ image: newPanorama, id: id });
      ImagesUrlObject.push(url);
      archivos.push(url);
      panoramaA.push(newPanorama);
    });
    id_iconH=mapa.icon_hotspot;
    id_iconI=mapa.icon_infospot;
    if(id_iconH==1){
      hotspot_image_url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADPklEQVR42u2bMUscQRiG30/SRaJEI1ZKUiRErNIELRUbQYSAnX8hpVUgkDYp0wgWVjYW+QcJaQzYpLojJIXhtDDEKBpj65ti58ixmdmb2ZvZ7+T2AUHudmfmeXf2bnb3O6CmpqZmgJGqOiI5AWAWwEMA0wDuArht3r4CcAagBeAbgIaI/NQOp1fhIZKLJN+SbDKcptl3keSQtk+I+BjJVyRbJaRdtEybY9p+ReKjJN+QvIwonufS9DGq7ZuXXyd5nFA8zzHJdW1vkLxDcrdC8Ty7JO9oyc+QPFCUb3NAcqZq+TmSp9rmHZySnCvjErwOIPkUwHv8+w7vF64ALIrIfrIASM4C+ADgnratgxMACyLSiB4AyREAnwE80LbswgGAJyJy4bNxyApr6wbIw4xxy3djrwCYfeeuaZsFsEbPdULXU4DZqusLgMkEA21P05EEbf8A8FhEzos28pkBLxLKL5s/r/M1kEkz9vKQHGeatf05yfmOfubNa7G5JDle5NhtBjwHMBz5yFwAWBaRT+0XzP8pZsKwcQiH2fX8Ycojb+kzxUw4ZJn7CSQXqpRPHMKCq7+iZJ71Mvdy/DftXSQ6HcJdSDaqPPKW/mPOBO+lcbvzCU35RCFM2PpwnQKzZQfdgfe0dxH5dLA6uQJ4pC2fIASrkyuA6X6QjxyC1ckVQNn7bNHlI4ZgdXIFUObiJJl8pBCsTjGfuIwA2Cv4FN7xbYjkjqsRAHuIePXoCiDF1Zk2VidXAL+1R5sAq5MrgJb2aBNgdXIF8FV7tAmwOrkCCFs73wysTtYATHFCU3vEEWm6Ci6KvgY/ao86Ik6XogDeaY86Ik6XbjPgSHvkEThCwQy45XpDRK5JbgN4GWkgUyR9H65MRQxgW0SunZ5FezK7pfwd8e8MV8UfAPdF5Jdrg8JrAbPjprZFD2wWyQP6j8ZSEufRmGlgQ9umBBvd5IOgbjFUKLu+XnWBhG+rpsFVZGUo/coJgFVf+aAATAgNACvICpL6jSsAKyH1QcEBmBD2ASwhq+7uF84ALIVWiPUEB7lQsiOEwS2VzQUxmMXSuRCqKpd/zX4rl88FMZg/mLAEcSN+MlP/aKqmpqZmkPkL0hSjwOpNKxwAAAAASUVORK5CYII=";
    }else if(id_iconH==2){
      hotspot_image_url="data:image/png;base64,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";
    }
    else if(id_iconH==3){
      hotspot_image_url="data:image/png;base64,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";
    }else if(id_iconH==4){
      hotspot_image_url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADPklEQVR42u2bMUscQRiG30/SRaJEI1ZKUiRErNIELRUbQYSAnX8hpVUgkDYp0wgWVjYW+QcJaQzYpLojJIXhtDDEKBpj65ti58ixmdmb2ZvZ7+T2AUHudmfmeXf2bnb3O6CmpqZmgJGqOiI5AWAWwEMA0wDuArht3r4CcAagBeAbgIaI/NQOp1fhIZKLJN+SbDKcptl3keSQtk+I+BjJVyRbJaRdtEybY9p+ReKjJN+QvIwonufS9DGq7ZuXXyd5nFA8zzHJdW1vkLxDcrdC8Ty7JO9oyc+QPFCUb3NAcqZq+TmSp9rmHZySnCvjErwOIPkUwHv8+w7vF64ALIrIfrIASM4C+ADgnratgxMACyLSiB4AyREAnwE80LbswgGAJyJy4bNxyApr6wbIw4xxy3djrwCYfeeuaZsFsEbPdULXU4DZqusLgMkEA21P05EEbf8A8FhEzos28pkBLxLKL5s/r/M1kEkz9vKQHGeatf05yfmOfubNa7G5JDle5NhtBjwHMBz5yFwAWBaRT+0XzP8pZsKwcQiH2fX8Ycojb+kzxUw4ZJn7CSQXqpRPHMKCq7+iZJ71Mvdy/DftXSQ6HcJdSDaqPPKW/mPOBO+lcbvzCU35RCFM2PpwnQKzZQfdgfe0dxH5dLA6uQJ4pC2fIASrkyuA6X6QjxyC1ckVQNn7bNHlI4ZgdXIFUObiJJl8pBCsTjGfuIwA2Cv4FN7xbYjkjqsRAHuIePXoCiDF1Zk2VidXAL+1R5sAq5MrgJb2aBNgdXIF8FV7tAmwOrkCCFs73wysTtYATHFCU3vEEWm6Ci6KvgY/ao86Ik6XogDeaY86Ik6XbjPgSHvkEThCwQy45XpDRK5JbgN4GWkgUyR9H65MRQxgW0SunZ5FezK7pfwd8e8MV8UfAPdF5Jdrg8JrAbPjprZFD2wWyQP6j8ZSEufRmGlgQ9umBBvd5IOgbjFUKLu+XnWBhG+rpsFVZGUo/coJgFVf+aAATAgNACvICpL6jSsAKyH1QcEBmBD2ASwhq+7uF84ALIVWiPUEB7lQsiOEwS2VzQUxmMXSuRCqKpd/zX4rl88FMZg/mLAEcSN+MlP/aKqmpqZmkPkL0hSjwOpNKxwAAAAASUVORK5CYII=";
    }
    if(id_iconI==1){
      infospot_image_url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADBklEQVR42u2bP08UQRiHnzFaSYCI/xoksdBIqGwIiYWRUBISExpCQ0ej38FWOmlIKKhoMPEbaCxsrrHiYrQgOSlQEaICrT+LHSPZzNzt3s3c3Hn7lHvLzvv82L2dm30XKioqKgYY062BJF0HpoA7wARwBbhsPz4DjoEG8AnYNcZ8Sx1Op8IXJM1KWpdUV3nq9m9nJV1I7VNGfEzSM0mNNqR9NOwxx1L7NRMflbQm6SSgeJ4TO8Zoat+8/LKkg4jieQ4kLaf2RtKwpJ0uiufZkTScSn5S0l5C+b/sSZrstvyMpKPU5uc4kjTTjkvpeYCkaeA1/+7hvcIZMGuMqUULQNIU8Aa4ltrWwyHwyBizGzwASSPAe+B2assW7AH3jTE/i+xcZoa12Qfy2Bo3i+5cKABl99zF1GYlWFTBeULLS0DZrOsDcDNggTXgc27bLWA64BhfgHvGmB8dHUXZ1DM0S45xliKMs9bKr+klIOkqsBrwv9JtVq1DewEAT4Ch1BYdMGQdygeg7Df4SmqDAKyoyXpCszPgITCeuvoAjFuX0gE8jljUdv7bCtiOOJ7XpdUZ8L/gdXHOA5QtYH5NXXVgbrgWWn1nwFTqaiPgdPIFcDd1tRFwOl307DwRuZgXwLvctgfA04hjOp18AcReZ6sZY16e3yDpUuQxnU6+S2AkcjEpcDr1zxOXSPgCKLSa0mc4nXwB/EpdbQScTr4AGqmrjYDTyRfAx9TVRsDp5Aug8LJyH+F0cgZg58z11BUHpO5ruGh2G3ybuuqAeF2aBfAqddUB8bq0OgP2U1cegH3aOQOMMb+BrdTVB2DLupQLwLIOnKY26IBT6+ClaQDGmO/ARmqLDtiwDn7HVkcY+EdjNoTlCI+tYhO2iUppm6HKslPUq2qQKHpUe8AFsjaUXuUQWCgqXyoAG8IuME/WkNRrnAHzZfqDSgdgQ6gBc2Td3b3CMTBXtkOsIzTIjZLnQhjcVtlcEIPZLJ0LoVvt8s/Va+3yuSAG84UJRxB98cpM9dJURUVFxSDzBxKde4Lk3/h2AAAAAElFTkSuQmCC";
    }else if(id_iconI==2){
      infospot_image_url="data:image/png;base64,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";
    }
    else if(id_iconI==3){
      infospot_image_url="data:image/png;base64,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";
    }else if(id_iconI==4){
      infospot_image_url="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADBklEQVR42u2bP08UQRiHnzFaSYCI/xoksdBIqGwIiYWRUBISExpCQ0ej38FWOmlIKKhoMPEbaCxsrrHiYrQgOSlQEaICrT+LHSPZzNzt3s3c3Hn7lHvLzvv82L2dm30XKioqKgYY062BJF0HpoA7wARwBbhsPz4DjoEG8AnYNcZ8Sx1Op8IXJM1KWpdUV3nq9m9nJV1I7VNGfEzSM0mNNqR9NOwxx1L7NRMflbQm6SSgeJ4TO8Zoat+8/LKkg4jieQ4kLaf2RtKwpJ0uiufZkTScSn5S0l5C+b/sSZrstvyMpKPU5uc4kjTTjkvpeYCkaeA1/+7hvcIZMGuMqUULQNIU8Aa4ltrWwyHwyBizGzwASSPAe+B2assW7AH3jTE/i+xcZoa12Qfy2Bo3i+5cKABl99zF1GYlWFTBeULLS0DZrOsDcDNggTXgc27bLWA64BhfgHvGmB8dHUXZ1DM0S45xliKMs9bKr+klIOkqsBrwv9JtVq1DewEAT4Ch1BYdMGQdygeg7Df4SmqDAKyoyXpCszPgITCeuvoAjFuX0gE8jljUdv7bCtiOOJ7XpdUZ8L/gdXHOA5QtYH5NXXVgbrgWWn1nwFTqaiPgdPIFcDd1tRFwOl307DwRuZgXwLvctgfA04hjOp18AcReZ6sZY16e3yDpUuQxnU6+S2AkcjEpcDr1zxOXSPgCKLSa0mc4nXwB/EpdbQScTr4AGqmrjYDTyRfAx9TVRsDp5Aug8LJyH+F0cgZg58z11BUHpO5ruGh2G3ybuuqAeF2aBfAqddUB8bq0OgP2U1cegH3aOQOMMb+BrdTVB2DLupQLwLIOnKY26IBT6+ClaQDGmO/ARmqLDtiwDn7HVkcY+EdjNoTlCI+tYhO2iUppm6HKslPUq2qQKHpUe8AFsjaUXuUQWCgqXyoAG8IuME/WkNRrnAHzZfqDSgdgQ6gBc2Td3b3CMTBXtkOsIzTIjZLnQhjcVtlcEIPZLJ0LoVvt8s/Va+3yuSAG84UJRxB98cpM9dJURUVFxSDzBxKde4Lk3/h2AAAAAElFTkSuQmCC";
    }
    cliente=mapa.cliente;
    nombre=mapa.nombre;
    visualizar_panoramas();
    return panoramas;
  }
//crea las acciones y los hotspot spots
  function createHotspotActions(mapa, panoramas) {
    mapa.scene.forEach((sceneO) => {
      const hotspots = sceneO.hotspot;
      hotspots.forEach((hotspotO) => {
        const positionX = hotspotO.coordenadaP.x ;
        const positionY = hotspotO.coordenadaP.y ;
        const positionZ = hotspotO.coordenadaP.z ;
        // var textureLoader = new THREE.TextureLoader();
        const newSpot = new PANOLENS.Infospot(700,hotspot_image_url,animated=true);
        const text=hotspotO.id
        panoramas.forEach((panorama) => {
          if (panorama.id == hotspotO.id) {
            const text=panorama.image.src
            const new_text = text.replace('/public/recorridos/'+id_rec+'/','');
            newSpot.addHoverText(new_text,80);
          }
        });
        newSpot.position.set(positionX, positionY, positionZ);
        // panoramas.forEach((panorama) => {
        //   if (panorama.id === hotspotO.id) {
        //     newSpot.addEventListener("click", () => {
        //       const rotationX = hotspotO.coordenadaR.x ;
        //       const rotationY = hotspotO.coordenadaR.y ;
        //       const rotationZ = hotspotO.coordenadaR.z ;
        //       // console.log(rotationX,rotationY,rotationZ);
        //       const cameraLookAt = new THREE.Vector3(
        //         -rotationX, ///***se agregó un menos para quitar el menos que se usa en panolens(en el vector de 3js no se usa)****/
        //         rotationY,
        //         rotationZ
        //       );
        //       panorama.image.addEventListener("enter-fade-start", function () {
        //         viewer.tweenControlCenter(cameraLookAt, 0);
        //       });
        //       viewer.setPanorama(panorama.image);
        //     });
        //   }
        // });
        let xyz_position= new coordenada((positionX),(positionY),(positionZ));
        let xyz_obj_camera= new coordenada((hotspotO.coordenadaR.x),(hotspotO.coordenadaR.y),(hotspotO.coordenadaR.z));
        let hot_obj =new hotspot(hotspotO.id,xyz_position,xyz_obj_camera);
        // console.log(array_scenes);
        panoramas.forEach((panorama) => {
          try{
          if (panorama.id === sceneO.id) {
            panorama.image.add(newSpot);
            array_scenes[panorama.id].hotspot.push(hot_obj);
          }
          }catch{console.log("error en creacion de hotspots")}
        });
      });
    });
    return panoramas;
  }

  function createInfospotActions(mapa, panoramas) {
    mapa.scene.forEach((sceneO) => {
      const infospots = sceneO.infospot;
      infospots.forEach((infospotO) => {
        const IpositionX = infospotO.coordenadaP.x ;
        const IpositionY = infospotO.coordenadaP.y ;
        const IpositionZ = infospotO.coordenadaP.z ;
        const text = infospotO.info;
        const newInfoSpot = new PANOLENS.Infospot(500,infospot_image_url,animated=true);
        newInfoSpot.position.set(IpositionX, IpositionY, IpositionZ);
        newInfoSpot.addHoverText(text,80);
        let xyz_obj= new coordenada((IpositionX),(IpositionY),(IpositionZ));
        let info_obj =new infospot(xyz_obj,text);
        panoramas.forEach((panorama) => {
          try{
            if (panorama.id === sceneO.id) {
              panorama.image.add(newInfoSpot);
              array_scenes[panorama.id].infospot.push(info_obj);
            }
          }catch{
            console.log("adv : hay hotspot sin panorama a conectar")
          }
        });
      // console.log(array_scenes);
      });
    });
    return panoramas;
  }
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
function recorrido (id_rec,scene=[],icon_hotspot,icon_infospot,cliente,nombre){
  this.id_rec=id_rec
  this.scene=scene;
  this.icon_hotspot=icon_hotspot;
  this.icon_infospot=icon_infospot;
  this.cliente=cliente;
  this.nombre=nombre
}
//agregar imagenes
document.querySelector("#image_input").addEventListener("change", function () {
  var newImagesUrlObject=[] ;
  for(let i=0; i<this.files.length;i++){
    archivos.push(this.files[i]);
    newImagesUrlObject[i]=URL.createObjectURL(this.files[i]);
    ImagesUrlObject.push(newImagesUrlObject[i]);
    console.log("---nuevo archivo subido en la url : "+newImagesUrlObject[i]);
    console.log(archivos)
    let array_info=[]; //arreglo de objetos infospot
    let array_hot=[]; // arreglo de objetos hotspot
    const id = (archivos.length-1);
    // var src = archivos[i].name;
    var src = this.files[i].name;
    var sce =new scene (id,src,array_info,array_hot);
    array_scenes.push(sce);
    console.log(array_scenes)
  }
  for(let e=0; e<newImagesUrlObject.length;e++){
    panorama = new PANOLENS.ImagePanorama(newImagesUrlObject[e]); // se genera panorama un objeto imagePanorama
    panorama.addEventListener( 'progress', onProgressUpdate );
    viewer.add(panorama);
    panoramaA.push(panorama);
  }
  try {
    // document.getElementById("form_img2").submit(); //sube las imagenes
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
      .then((res) => console.log(res))
        .catch((err) => ("Error occured", err));
    document.getElementById("number_img").innerHTML = (panoramaActual+1)+" / "+(panoramaA.length);
    window.alert("Elemento(s) agregado(s)")
  } catch (error) {
    window.alert("Error: no se pudo agregar")
  }
});

//llama a crear el viewer los panoramas, los objetos scene y define la imagen preview del primer panorama
function visualizar_panoramas(){
  document.querySelector(".image-preview").style.display = "block";
  document.querySelector(".image-preview").setAttribute("src", ImagesUrlObject[0]);  
  const new_name = (archivos[0].replace('/public/recorridos/'+id_rec+'/',''));
  document.getElementById("name_img").innerHTML =new_name;
  panoImage=document.querySelector("#tour_panolens");
  crear_viewer();
  for(let e=0; e<panoramaA.length;e++){
    crear_panoramas(panoramaA[e]);
  }
  panoramaActual=0;
  document.getElementById("number_img").innerHTML = (panoramaActual+1)+" / "+(panoramaA.length);
  GenerateScenes();
  habilitar_btn();
  document.querySelector("#p_consejo").innerHTML="Ingrese los hotspot o infospots del recorrido";
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
  viewer.add(imagen);
}
//genera los objetos secenes por cada archivo subido
function GenerateScenes (){
  for (let i = 0; i < archivos.length; i++) {
    let array_info=[]; //arreglo de objetos infospot
    let array_hot=[]; // arreglo de objetos hotspot
    var id = i;
    var src = archivos[i];
    const new_src = (src.replace('/public/recorridos/'+id_rec+'/',''));
    var sce =new scene (id,new_src,array_info,array_hot);
    // console.log(sce);
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
      // infospotsA.push(myInfospot);
      ObtenerPanoramaActual().toggleInfospotVisibility(true,100); // parametro 2 tiempo de aparicion
      // myInfospot.setText("cambiado");
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
    if(archivos[panoActualHotspot].name){//comprueba si hay el archivo no es del server y es un objeto con nombre
      document.getElementById("name_img").innerHTML = archivos[panoActualHotspot].name;
    }
    else{
      const new_name = (archivos[panoActualHotspot].replace('/public/recorridos/'+id_rec+'/',''));
      document.getElementById("name_img_hotspot").innerHTML =new_name;
    }
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
  let text;
  if(archivos[panoActualHotspot].name){//comprueba si hay el archivo no es del server y es un objeto con nombre
     text=archivos[panoActualHotspot].name;
  }
  else{
     text=(archivos[panoActualHotspot]).replace('/public/recorridos/'+id_rec+'/','');
  }
  myHotspot.addHoverText((text),55);
  panoramaA[panohotspot].add(myHotspot);
  panoramaA[panohotspot].toggleInfospotVisibility(true,200);
  let xyz_obj_camera=GetPosition();
  let hot_obj =new hotspot(panoActualHotspot,xyz_position,xyz_obj_camera);
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
  document.getElementById("btn_add_img").style.display = "none";
  document.getElementById("btn_delete_pano").style.display = "none";
  
}
//activa todos los botones 
function habilitar_btn(){
  document.getElementById("btn_infospot").disabled = false;
  document.getElementById("btn_hotspot").disabled = false;
  document.getElementById("btn_next").disabled = false;
  document.getElementById("btn_last").disabled = false;
  document.getElementById("btn_guardar").disabled = false;
  document.getElementById("btn_eliminar").disabled = false;
  document.getElementById("btn_add_img").style.display = "inline-block";
  document.getElementById("btn_delete_pano").style.display = "inline-block";
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
    if(archivos[panoramaActual].name){//comprueba si hay el archivo no es del server y es un objeto con nombre
      document.getElementById("name_img").innerHTML = archivos[panoramaActual].name;
    }
    else{
      const new_name = (archivos[panoramaActual].replace('/public/recorridos/'+id_rec+'/',''));
      document.getElementById("name_img").innerHTML = new_name;
    }
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
  // console.log(archivos);
  if(archivos[panoramaActual].name){//comprueba si hay el archivo no es del server y es un objeto con nombre
    document.getElementById("name_img").innerHTML = archivos[panoramaActual].name;
  }
  else{
    const new_name = (archivos[panoramaActual].replace('/public/recorridos/'+id_rec+'/',''));
    document.getElementById("name_img").innerHTML = new_name;
  }
  document.getElementById("number_img").innerHTML = (panoramaActual+1)+" / "+(panoramaA.length);
  DesactivarBotones();
}
//cambia el priview de la imagen a conectar en el hotspot
function NextPanoHotspot(){
  if(ImagesUrlObject[panoActualHotspot+1]!=undefined){
    document.getElementById("img_select_spot").src=ImagesUrlObject[panoActualHotspot+1];
    panoActualHotspot++;
    document.getElementById("number_img_hotspot").innerHTML = (panoActualHotspot+1)+" / "+(panoramaA.length);
    if(archivos[panoActualHotspot].name){//comprueba si hay el archivo no es del server y es un objeto con nombre
      document.getElementById("name_img_hotspot").innerHTML = archivos[panoActualHotspot].name;
    }else{
      const new_name = (archivos[panoActualHotspot].replace('/public/recorridos/'+id_rec+'/',''));
      document.getElementById("name_img_hotspot").innerHTML =new_name;
    }
  }
}
//cambia el priview de la imagen a conectar en el hotspot
function LastPanoHotspot(){
  if(ImagesUrlObject[panoActualHotspot-1]!=undefined){
    document.getElementById("img_select_spot").src=ImagesUrlObject[panoActualHotspot-1];
    panoActualHotspot--;
    document.getElementById("number_img_hotspot").innerHTML = (panoActualHotspot+1)+" / "+(panoramaA.length);
    if(archivos[panoActualHotspot].name){//comprueba si hay el archivo no es del server y es un objeto nuevo con nombre
      document.getElementById("name_img_hotspot").innerHTML = archivos[panoActualHotspot].name;
    }else{
      const new_name = (archivos[panoActualHotspot].replace('/public/recorridos/'+id_rec+'/',''));
      document.getElementById("name_img_hotspot").innerHTML =new_name;
    }
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
  //cambia el label xyz de html
  // document.getElementById("ejes").innerHTML = " X: "+ejes_xyz.x+" Y: "+ejes_xyz.y+" Z: "+ejes_xyz.z;
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
        console.log(array_scenes[panoramaActual].hotspot);
      }
    }
  }
  this.dispose();
}
//borrar panorama actual y los hotspots que apuntan a este 
//cambiar de posición todos los elementos en los arrays
function delete_pano(){
  const res =window.confirm("¿Desea borrar la imagen actual?")
  if(res&&panoramaA.length>1){
   try{
     inhabilitar_btn();
      const id_pano_borrado=panoramaActual;
      for (var index = 0; index < panoramaA.length; index++) {
          var c=0;
        while(c<(panoramaA[index].children).length){
          if(panoramaA[index].children[c].element.innerText==document.getElementById("name_img").innerHTML){
            panoramaA[index].children[c].dispose();
            console.log(" match hotspot borrado en la escena");
          } else{ c++
            console.log("no hay match de hotspot en la esecena");
          } 
        }
      }
      for (var index = 0; index < (array_scenes).length; index++) {
        var r=0
        while(r<array_scenes[index].hotspot.length){
          if(array_scenes[index].hotspot[r].id==id_pano_borrado){
            (array_scenes[index].hotspot).splice(r,1);
            console.log("hay match hotspot borrado");       
          }else{ r++
            console.log("no hay match de hotspots que conecte con ese pano");
          } 
        }
        for (var index2 = 0; index2 < (array_scenes[index].hotspot).length; index2++) {
          if(array_scenes[index].hotspot[index2].id>id_pano_borrado){
            array_scenes[index].hotspot[index2].id--;
          }
        }
      }
      for (let index = 0; index < (array_scenes).length; index++) {
        if(array_scenes[index].id>id_pano_borrado){
          array_scenes[index].id--;
        } 
      }
      console.log("todos los loops termiandos");
      console.log(array_scenes);
      panoramaA[id_pano_borrado].dispose();
      array_scenes.splice(id_pano_borrado,1)
      panoramaA.splice(id_pano_borrado,1)
      ImagesUrlObject.splice(id_pano_borrado,1);
      archivos.splice(id_pano_borrado,1);
      // console.log(panoramaA)
      // console.log(ImagesUrlObject)
      // console.log(archivos)
      window.alert("Se eliminó la imagen y los hotspots que apuntaban a esta imagen");
      viewer.setPanorama( panoramaA[0] );
      panoramaActual=0;
      cambiar_image_preview();
      habilitar_btn();
    }catch{window.alert("Error al borrar")}
  }else if (panoramaA.length<=1){
    window.alert("Debe mantener como minimo una imagen")
  }
}

function abrir_conf_datos(){
  DesactivarBotones();
  document.getElementById("text_nom_cli").setAttribute("value", cliente);
  document.getElementById("text_nom_rec").setAttribute("value", nombre);
  document.getElementById("editar_conf").style.display="block";
  inhabilitar_btn(); 
}
function abrir_conf_spot(){
  document.getElementById("editar_conf").style.display="none"; 
  document.getElementById("conf_spot").style.display="block";
  document.getElementById("icon_hot").src=(hotspot_image_url);
  document.getElementById("icon_info").src=(infospot_image_url);
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
  document.getElementById("conf_spot").style.display="none";
  document.getElementById("icono_usado_hot").src=(hotspot_image_url);
  document.getElementById("icono_usado_info").src=(infospot_image_url);
  abrir_conf_datos();
}
//  gnera el JSON con los datos del scenes array
//muestra el mensaje de exito
function generarJSONfile (){
  document.getElementById("editar_conf").style.display="none";
  document.getElementById('text_area_link').value="http://localhost:3000/public/visualizador.html?id="+id_rec;
  // document.getElementById('text_area_iframe').value=text;
  console.log(hotspot_image_url);
    if(hotspot_image_url.indexOf("arrow-up")!== -1){
      id_iconH=1;
    }
    else if(hotspot_image_url.indexOf("spot")!== -1){
      id_iconH=2;
    }else if(hotspot_image_url.indexOf("negro")!== -1){
      id_iconH=3;
      console.log("entre");
    }
    else if(hotspot_image_url.indexOf("logo")!== -1){
      id_iconH=4;
    }
    if(infospot_image_url.indexOf("information")!== -1){
      id_iconI=1;
    }
    else if(infospot_image_url.indexOf("gris")!== -1){
      id_iconI=2;
    }else if(infospot_image_url.indexOf("inf-negro")!== -1){
      id_iconI=3;
    }
    else if(infospot_image_url.indexOf("logo")!== -1){
      id_iconI=4;
    }
  if((document.getElementById("text_nom_cli").value)!=""&&(document.getElementById("text_nom_rec").value)!=""){
    cliente=document.getElementById("text_nom_cli").value;
    nombre=document.getElementById("text_nom_rec").value;
  }
    const recorridoO= new recorrido(id_rec,array_scenes,id_iconH,id_iconI,cliente,nombre);
    jsonString = JSON.stringify(Object.assign( recorridoO));
    console.log(jsonString);

    fetch('/update_data', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({jsonString})
    })

    document.getElementById("guardado_exitoso").style.display="block"; //muestra la ventana 
    document.querySelector("#p_consejo").innerHTML="";
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