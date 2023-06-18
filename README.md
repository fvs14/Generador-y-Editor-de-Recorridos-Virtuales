# Generador-y-Editor-de-Recorridos-Virtuales
Proyecto programable de Tesina:

Aplicación web para generar y editar recorridos virtuales usando javascript, nodejs, 3Js , Panolens y MongoDB para la empresa MAPB. 

Este es un proyecto para la empresa MAPB para la creación edición y despliegue de recorridos virtuales en el cual se incluye el front end y backend de la aplicación

Para desplegar la herramienta localmente se debe:

1-instalar nodejs

2 instalar el gestor npm (npm install g- npm)

3-usar los comandos en la linea de comando: npm install package.json

4-crear un cluster con una base de datos llamada: MAPB en mongodb atlas

5-copiar el connection string de la base generada por mongodb, en un archivo llamado "password.txt" y agregarlo a la carpeta del proyecto mapb3js 

5.1-incluir en mongodb Atlas la ip donde se correra el proyecto o elegir la opcion que permite a cualquer ip conectarse a la base 

6-crear las colecciones "usuarios" y "tours" en la base

7- crear un usuario desde mongodb en la colección de usuarios ejemplo: 
usuario: admin 
nombre: admin 
password : (generar un password encriptado con metodo hash usando la página https://bcrypt-generator.com/ con el round en 10 ) 

**la colección tours ira vacia ya que la herramienta se encarga de crear los recorridos con su debido formato json

8- abrir el folder map3js en Visual Studio Code y correr mediante la linea de comando: node index.js

9- abrir en el navegador el puerto 3000 usando: http://localhost:3000/ **usar un navegador compatible con webgl

10-ingresar el usuario(admin) y la contraseña (el loguin se encarga de desencriptar la constraseña y compararla con la que se ingresa al logearse)
