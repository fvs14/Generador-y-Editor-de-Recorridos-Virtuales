Este es un proyecto para la empresa MAPB para la creación edición y despliegue de recorridos virtuales
actualmente hospedado en el servidor con la dirección http://137.184.87.92

Para desplegar la herramienta localmente se debe: 

1-instalar nodejs 

2-usar o instalar el gestor npm (npm install g- npm)

3-usar los comandos en la linea de comando: 
    npm install package.json

4-crear una base de datos llamada: MAPB en mongodb con atlas

5-copiar el connection string de la base generada por mongodb, en un archivo llamado "password.txt" y agregarlo a la carpeta del proyecto mapb3js
**mongodb debe aceptar la coneccion de la ip donde se corra la herramienta en caso de seleccionar esta opción de seguridad en mongodb

6-crear las colecciones llamadas "usuarios" y "tours" en la base

7- crear en la colección de usuarios:
    usuario: admin
    nombre: admin
    password : (password encriptado con metodo hash usando la página https://bcrypt-generator.com/)
**la colección tours ira vacia ya que la herramienta se encarga de crear los recorridos con su debido formato json

8- abrir unicamente el folder map3js en Visual Studio Code y correr mediante la linea de comando: 
    node index.js

9- abrir en el navegador el puerto 3000 usando:
    http://localhost:3000/
**usar un navegador compatible con webgl

10-ingresar el usuario(admin) y la contraseña ingresada sin la encriptación en el loguin de la herramienta


