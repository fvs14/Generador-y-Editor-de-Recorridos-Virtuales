
var icono_hot;
var icono_info;
var id_iconH;
var id_iconI;
var controlcube=[];

//consigue y tranforma los parametros enviados en la url a variable
const queryString = window.location.search;
// console.log(queryString);
const urlParams = new URLSearchParams(queryString);
const id_rec = urlParams.get('id');
// console.log(id_rec);

// flujo main script
// Crea el visualizador
const viewer3 = new PANOLENS.Viewer({
    container: document.querySelector("#contenedor"),
    controlBar: true, // Vsibility of bottom control bar
    controlButtons: ["fullscreen", "setting", "video"], // Buttons array in the control bar. Default to ['fullscreen', 'setting', 'video']
    autoHideInfospot: false, // Auto hide infospots
    cameraFov: 70, // zoom
    output: "console", // Whether and where to output infospot position. Could be 'console' or 'overlay'
    autoRotate: true, 
    autoRotateSpeed: 0.5, 
    autoRotateActivationDuration: 9000
});
buscar_recorrido();

//pide al server los parametros recibidos y empieza a crear el recorrido con la res
async function buscar_recorrido(){
  try{
    await fetch('/obtner_rec', {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: new URLSearchParams({id_rec})
    })
    .then(async(response) => await response.text())
    .then(async(text)  =>  {
      text= JSON.parse(text);
      // console.log(text);
      const panoramas =  createPanoramas(text); //array de objetos con atributos panoramas y ids
      document.getElementById("caja_loader").style.display="none";
      const panoramasWithHotspots =  createHotspotActions(text, panoramas); //
      const panoramasWithInfospots =  createInfospotActions(text, panoramas); //
      const scene =  createScene(panoramasWithHotspots);
    });
  }
  catch{
    // console.error(e);
    window.alert("Error al cargar")
  }
}
  // //recorrido a leer
  // const jsonURL = "./assets/recorridos/"+nom_recorrido+".json";
  
  //then retorna una promesa de la recuperacion del json file
  //
  // function fetchData() {
  //   return fetch(jsonURL).then((res) => res.json());
  // }

  
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

  function createPanoramas(mapa) {
    // console.log(mapa);
    const panoramas = [];
    mapa.scene.forEach((sceneO) => {
      //por cada contenido en el json(map) creo un objeto scene
      //saco los datos src y id de scene y los guarda en las constantes url y id
      const url = "/public/recorridos/"+id_rec+"/"+sceneO.src;
      const id = sceneO.id;
      //se crean objetos llamdos new panorama que usan url para crearse
      const newPanorama = new PANOLENS.ImagePanorama(url);
      newPanorama.addEventListener( 'progress', onProgressUpdate );
      //mete en el array todos los objetos
    
      var controlItemCube = {
        style: {
          backgroundImage: 'url("/assets/spot mini.png")',
          float:'left'
        },
        onTap: function(){
          bar.classList.remove( 'hide' ); 
          document.getElementById("caja_loader").style.display="block";    
          viewer3.setPanorama(newPanorama);
          document.getElementById("caja_loader").style.display="none";
        }
      };
      viewer3.appendControlItem(controlItemCube);

      panoramas.push({ image: newPanorama, id: id });
    });
    // console.log(panoramas);
    id_iconH=mapa.icon_hotspot;
    id_iconI=mapa.icon_infospot;
    // console.log(id_iconH,+" "+id_iconI);
    if(id_iconH==1){
      icono_hot="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADPklEQVR42u2bMUscQRiG30/SRaJEI1ZKUiRErNIELRUbQYSAnX8hpVUgkDYp0wgWVjYW+QcJaQzYpLojJIXhtDDEKBpj65ti58ixmdmb2ZvZ7+T2AUHudmfmeXf2bnb3O6CmpqZmgJGqOiI5AWAWwEMA0wDuArht3r4CcAagBeAbgIaI/NQOp1fhIZKLJN+SbDKcptl3keSQtk+I+BjJVyRbJaRdtEybY9p+ReKjJN+QvIwonufS9DGq7ZuXXyd5nFA8zzHJdW1vkLxDcrdC8Ty7JO9oyc+QPFCUb3NAcqZq+TmSp9rmHZySnCvjErwOIPkUwHv8+w7vF64ALIrIfrIASM4C+ADgnratgxMACyLSiB4AyREAnwE80LbswgGAJyJy4bNxyApr6wbIw4xxy3djrwCYfeeuaZsFsEbPdULXU4DZqusLgMkEA21P05EEbf8A8FhEzos28pkBLxLKL5s/r/M1kEkz9vKQHGeatf05yfmOfubNa7G5JDle5NhtBjwHMBz5yFwAWBaRT+0XzP8pZsKwcQiH2fX8Ycojb+kzxUw4ZJn7CSQXqpRPHMKCq7+iZJ71Mvdy/DftXSQ6HcJdSDaqPPKW/mPOBO+lcbvzCU35RCFM2PpwnQKzZQfdgfe0dxH5dLA6uQJ4pC2fIASrkyuA6X6QjxyC1ckVQNn7bNHlI4ZgdXIFUObiJJl8pBCsTjGfuIwA2Cv4FN7xbYjkjqsRAHuIePXoCiDF1Zk2VidXAL+1R5sAq5MrgJb2aBNgdXIF8FV7tAmwOrkCCFs73wysTtYATHFCU3vEEWm6Ci6KvgY/ao86Ik6XogDeaY86Ik6XbjPgSHvkEThCwQy45XpDRK5JbgN4GWkgUyR9H65MRQxgW0SunZ5FezK7pfwd8e8MV8UfAPdF5Jdrg8JrAbPjprZFD2wWyQP6j8ZSEufRmGlgQ9umBBvd5IOgbjFUKLu+XnWBhG+rpsFVZGUo/coJgFVf+aAATAgNACvICpL6jSsAKyH1QcEBmBD2ASwhq+7uF84ALIVWiPUEB7lQsiOEwS2VzQUxmMXSuRCqKpd/zX4rl88FMZg/mLAEcSN+MlP/aKqmpqZmkPkL0hSjwOpNKxwAAAAASUVORK5CYII=";
    }else if(id_iconH==2){
      icono_hot="data:image/png;base64,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";
    }
    else if(id_iconH==3){
      icono_hot="data:image/png;base64,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";
    }else if(id_iconH==4){
      icono_hot="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADPklEQVR42u2bMUscQRiG30/SRaJEI1ZKUiRErNIELRUbQYSAnX8hpVUgkDYp0wgWVjYW+QcJaQzYpLojJIXhtDDEKBpj65ti58ixmdmb2ZvZ7+T2AUHudmfmeXf2bnb3O6CmpqZmgJGqOiI5AWAWwEMA0wDuArht3r4CcAagBeAbgIaI/NQOp1fhIZKLJN+SbDKcptl3keSQtk+I+BjJVyRbJaRdtEybY9p+ReKjJN+QvIwonufS9DGq7ZuXXyd5nFA8zzHJdW1vkLxDcrdC8Ty7JO9oyc+QPFCUb3NAcqZq+TmSp9rmHZySnCvjErwOIPkUwHv8+w7vF64ALIrIfrIASM4C+ADgnratgxMACyLSiB4AyREAnwE80LbswgGAJyJy4bNxyApr6wbIw4xxy3djrwCYfeeuaZsFsEbPdULXU4DZqusLgMkEA21P05EEbf8A8FhEzos28pkBLxLKL5s/r/M1kEkz9vKQHGeatf05yfmOfubNa7G5JDle5NhtBjwHMBz5yFwAWBaRT+0XzP8pZsKwcQiH2fX8Ycojb+kzxUw4ZJn7CSQXqpRPHMKCq7+iZJ71Mvdy/DftXSQ6HcJdSDaqPPKW/mPOBO+lcbvzCU35RCFM2PpwnQKzZQfdgfe0dxH5dLA6uQJ4pC2fIASrkyuA6X6QjxyC1ckVQNn7bNHlI4ZgdXIFUObiJJl8pBCsTjGfuIwA2Cv4FN7xbYjkjqsRAHuIePXoCiDF1Zk2VidXAL+1R5sAq5MrgJb2aBNgdXIF8FV7tAmwOrkCCFs73wysTtYATHFCU3vEEWm6Ci6KvgY/ao86Ik6XogDeaY86Ik6XbjPgSHvkEThCwQy45XpDRK5JbgN4GWkgUyR9H65MRQxgW0SunZ5FezK7pfwd8e8MV8UfAPdF5Jdrg8JrAbPjprZFD2wWyQP6j8ZSEufRmGlgQ9umBBvd5IOgbjFUKLu+XnWBhG+rpsFVZGUo/coJgFVf+aAATAgNACvICpL6jSsAKyH1QcEBmBD2ASwhq+7uF84ALIVWiPUEB7lQsiOEwS2VzQUxmMXSuRCqKpd/zX4rl88FMZg/mLAEcSN+MlP/aKqmpqZmkPkL0hSjwOpNKxwAAAAASUVORK5CYII=";
    }

    if(id_iconI==1){
      icono_info="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADBklEQVR42u2bP08UQRiHnzFaSYCI/xoksdBIqGwIiYWRUBISExpCQ0ej38FWOmlIKKhoMPEbaCxsrrHiYrQgOSlQEaICrT+LHSPZzNzt3s3c3Hn7lHvLzvv82L2dm30XKioqKgYY062BJF0HpoA7wARwBbhsPz4DjoEG8AnYNcZ8Sx1Op8IXJM1KWpdUV3nq9m9nJV1I7VNGfEzSM0mNNqR9NOwxx1L7NRMflbQm6SSgeJ4TO8Zoat+8/LKkg4jieQ4kLaf2RtKwpJ0uiufZkTScSn5S0l5C+b/sSZrstvyMpKPU5uc4kjTTjkvpeYCkaeA1/+7hvcIZMGuMqUULQNIU8Aa4ltrWwyHwyBizGzwASSPAe+B2assW7AH3jTE/i+xcZoa12Qfy2Bo3i+5cKABl99zF1GYlWFTBeULLS0DZrOsDcDNggTXgc27bLWA64BhfgHvGmB8dHUXZ1DM0S45xliKMs9bKr+klIOkqsBrwv9JtVq1DewEAT4Ch1BYdMGQdygeg7Df4SmqDAKyoyXpCszPgITCeuvoAjFuX0gE8jljUdv7bCtiOOJ7XpdUZ8L/gdXHOA5QtYH5NXXVgbrgWWn1nwFTqaiPgdPIFcDd1tRFwOl307DwRuZgXwLvctgfA04hjOp18AcReZ6sZY16e3yDpUuQxnU6+S2AkcjEpcDr1zxOXSPgCKLSa0mc4nXwB/EpdbQScTr4AGqmrjYDTyRfAx9TVRsDp5Aug8LJyH+F0cgZg58z11BUHpO5ruGh2G3ybuuqAeF2aBfAqddUB8bq0OgP2U1cegH3aOQOMMb+BrdTVB2DLupQLwLIOnKY26IBT6+ClaQDGmO/ARmqLDtiwDn7HVkcY+EdjNoTlCI+tYhO2iUppm6HKslPUq2qQKHpUe8AFsjaUXuUQWCgqXyoAG8IuME/WkNRrnAHzZfqDSgdgQ6gBc2Td3b3CMTBXtkOsIzTIjZLnQhjcVtlcEIPZLJ0LoVvt8s/Va+3yuSAG84UJRxB98cpM9dJURUVFxSDzBxKde4Lk3/h2AAAAAElFTkSuQmCC";
    }else if(id_iconI==2){
      icono_info="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABfVBMVEUAAABXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1ZXV1b////0YOmUAAAAfXRSTlMAAAsdMkRSWQgsYZfB3e73+/3ewiFotej+aSqI2xp/4YADT8rLEYfy686uk3Yir+KlYi8SBC3E0HUnJswZdKgCOSun7xSL8+mrhuZYm8lXTkj1hM8HMfxkAfGYDEzGtGYGUGxdUdHlfAkeNX68jw7IRYl6uNxeQvT52Go+StZahgsAAAABYktHRH4/uEFzAAAACXBIWXMAARlAAAEZQAGA43XUAAAAB3RJTUUH5gUBETYbYggr9AAAA4pJREFUWMO1l2db2zAQgJEznaQZEBIyiVMCGQYySQoUCnQBJbS0pVA66KLQRele+e+1hh07kuKEtP7g55F0enU6ne5OQ0P/6QPU1/9swWK12R0Ou81qEfphIFGn6HJ7Lnh9/kDA7/MOj7hdorNHBpQKjobCYy3DNxYORYI9EKBINBbvmE0Y8VjUBAGHE8nxFvcbTyW6IZQhKX2x1fWbSEtcgjKQmZxqa5zN5QspWU4V8rlse09TkxkOQementHkZoulcqWKT69aKZeKs9rQzDSToHTW5tTF641LktGNpPlGXVVjrsYgwPkLRGBYTnQ4IfovXh4mAgs0AepP1vcvidjSym95+sqKEwvDPnHVT3SgdqHYj+x/TRbIIABXr41fv3GzprWBIK8RO2SMAGWP63hkYxNo8s5bqGsrSIThSHMDy01KBgIAaXx+G9uabgDcvoOFdzRZZXAbE6bSeoDifxNY/02gE94hNhsRQFsSNPEuJhJA35vE9pOBvrdAAHczQLcWkLElk/q1otj/VwWgF5UJIHTPoK2whO9FVAeI4fMXjfu6j7e7+6DDXiL2h1jbWsE48r+G8XDBXmQfzn940AEADeST8fbpjKKO+iJ1to+WHj95ekD5TKKOFhxVAc4QUqnBcM/qwSFguG0D28ZJHEYMo/s3T90QTjwGYB7dzbBInNyFdlCUOPMZBKmI9uAiALeuZZyfePb8RXSPoVkJrenGAMEDG9kyZSvw8pW/NXb0+phGl7Nwjge5KDhBx5qrUFJvjrB/RmgVKjnkOBYEsHphI1+lAG+JJ747pgDVPBzwWhHA5oONAq3newLY+kAbAd0Tnw0B7LuwkeIDThmAFNqcHQEcAdiQ+wOgixZw/BuA3T/gFj6aGfHUxIjcY+wCMBwj15G6AIgjnWBXHuG4MhegujKOtuplKvUDMFwmznXuBiDXuUQA7IDCB3QEFF5I6wYwhDSlHWEFVS5ASfQdQZUd1nkAOqwrXWfMxMIDkMRypstMK8zUxgS0U9uKPmkzkysroDCTqy69N/Up9xMBfHaapHdegVH7gvp8X00LDGaJo3R+83wP/Pj569C8xOEUWSDzu/nH0gbyiyxDmbdKyjxjajMp85iFpmHUpNAcvNQ1KbZd5sU2Ntr6vibXd7k/+IOjlydPsuuTZ2jgR5eKGODZp565+vDcVR+epZ4fnhrj3E9fPeO8j+9+vr/A2iLKklQgeAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMi0wNS0wMVQxNzo1Mzo1NyswMDowMEV1c9wAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjItMDUtMDFUMTc6NTM6NTcrMDA6MDA0KMtgAAAAAElFTkSuQmCC";
    }
    else if(id_iconI==3){
      icono_info="data:image/png;base64,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";
    }else if(id_iconI==4){
      icono_info="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAABAAAAAQADq8/hgAAADBklEQVR42u2bP08UQRiHnzFaSYCI/xoksdBIqGwIiYWRUBISExpCQ0ej38FWOmlIKKhoMPEbaCxsrrHiYrQgOSlQEaICrT+LHSPZzNzt3s3c3Hn7lHvLzvv82L2dm30XKioqKgYY062BJF0HpoA7wARwBbhsPz4DjoEG8AnYNcZ8Sx1Op8IXJM1KWpdUV3nq9m9nJV1I7VNGfEzSM0mNNqR9NOwxx1L7NRMflbQm6SSgeJ4TO8Zoat+8/LKkg4jieQ4kLaf2RtKwpJ0uiufZkTScSn5S0l5C+b/sSZrstvyMpKPU5uc4kjTTjkvpeYCkaeA1/+7hvcIZMGuMqUULQNIU8Aa4ltrWwyHwyBizGzwASSPAe+B2assW7AH3jTE/i+xcZoa12Qfy2Bo3i+5cKABl99zF1GYlWFTBeULLS0DZrOsDcDNggTXgc27bLWA64BhfgHvGmB8dHUXZ1DM0S45xliKMs9bKr+klIOkqsBrwv9JtVq1DewEAT4Ch1BYdMGQdygeg7Df4SmqDAKyoyXpCszPgITCeuvoAjFuX0gE8jljUdv7bCtiOOJ7XpdUZ8L/gdXHOA5QtYH5NXXVgbrgWWn1nwFTqaiPgdPIFcDd1tRFwOl307DwRuZgXwLvctgfA04hjOp18AcReZ6sZY16e3yDpUuQxnU6+S2AkcjEpcDr1zxOXSPgCKLSa0mc4nXwB/EpdbQScTr4AGqmrjYDTyRfAx9TVRsDp5Aug8LJyH+F0cgZg58z11BUHpO5ruGh2G3ybuuqAeF2aBfAqddUB8bq0OgP2U1cegH3aOQOMMb+BrdTVB2DLupQLwLIOnKY26IBT6+ClaQDGmO/ARmqLDtiwDn7HVkcY+EdjNoTlCI+tYhO2iUppm6HKslPUq2qQKHpUe8AFsjaUXuUQWCgqXyoAG8IuME/WkNRrnAHzZfqDSgdgQ6gBc2Td3b3CMTBXtkOsIzTIjZLnQhjcVtlcEIPZLJ0LoVvt8s/Va+3yuSAG84UJRxB98cpM9dJURUVFxSDzBxKde4Lk3/h2AAAAAElFTkSuQmCC";
    }
    return panoramas;
  }
  //crea los hotspots con su respectivo evento 
  function createHotspotActions(mapa, panoramas) {
    mapa.scene.forEach((sceneO) => {
      const hotspots = sceneO.hotspot;
      hotspots.forEach((hotspot) => {
        const positionX = hotspot.coordenadaP.x ;
        const positionY = hotspot.coordenadaP.y ;
        const positionZ = hotspot.coordenadaP.z ;
        const newSpot = new PANOLENS.Infospot(700,icono_hot,animated=true);
        // const newSpot = new PANOLENS.Infospot(500,PANOLENS.DataImage.Arrow,animated=true);

        // var controlItemCube = {
        //   style: {
        //     backgroundImage: 'url("/assets/spot mini.png")',
        //     float:'left'
        //   },
        //   onTap: function(){
        //     const sp=ne
        //     if(newSpot.parent.src==viewer3.panorama.src){
        //       viewer3.tweenControlCenter( newSpot.position );
        //       // console.log(viewer3.widget.barElement.children);
              
        //     }
        //   }
        // };
        // viewer3.appendControlItem(controlItemCube);

        newSpot.position.set(positionX, positionY, positionZ);
        panoramas.forEach((panorama) => {
          if (panorama.id === hotspot.id) {
            newSpot.addEventListener("click", () => {
              document.getElementById("caja_loader").style.display="block";
              const rotationX = hotspot.coordenadaR.x ;
              const rotationY = hotspot.coordenadaR.y ;
              const rotationZ = hotspot.coordenadaR.z ;
              // console.log(rotationX,rotationY,rotationZ);
              const cameraLookAt = new THREE.Vector3(
                -rotationX, ///***se agregó un menos para quitar el menos que se usa en panolens(en el vector de 3js no se usa)****/
                rotationY,
                rotationZ
              );
              panorama.image.addEventListener("enter-fade-start", function () {
                viewer3.tweenControlCenter(cameraLookAt, 0);
              });
              bar.classList.remove( 'hide' );
              viewer3.setPanorama(panorama.image); 
              document.getElementById("caja_loader").style.display="none";
            });
          }
        });
        panoramas.forEach((panorama) => {
          if (panorama.id === sceneO.id) {
            panorama.image.add(newSpot);
            
          }
        });
      });
    });
    return panoramas;
  }
  //crea los infospot y su evento
  function createInfospotActions(mapa, panoramas) {
    mapa.scene.forEach((sceneO) => {
      const infospots = sceneO.infospot;
  
      infospots.forEach((infospot) => {
       
        const IpositionX = infospot.coordenadaP.x ;
        const IpositionY = infospot.coordenadaP.y ;
        const IpositionZ = infospot.coordenadaP.z ;
        const text = infospot.info;
        const newInfoSpot = new PANOLENS.Infospot(500,icono_info,animated=true);
        // const newSpot = new PANOLENS.Infospot(500,PANOLENS.DataImage.Arrow,animated=true);
        newInfoSpot.position.set(IpositionX, IpositionY, IpositionZ);
        newInfoSpot.addHoverText(text,80);
        panoramas.forEach((panorama) => {
          if (panorama.id === sceneO.id) {
            panorama.image.add(newInfoSpot);
            
          }
        });
      });
    });
    return panoramas;
  }
  /**
   * 
   * @param {array} panoramasWithHotspots
   */
  function createScene(panoramasWithHotspots) {
    panoramasWithHotspots.forEach((panorama) => {
      viewer3.add(panorama.image);
    });
  }
  
