const express = require('express');
const app = express();
const port=3000;

const bodyParser= require('body-parser')
const jsonParser=bodyParser.json()
const urlencodedParser= bodyParser.urlencoded({extended:false})

const fs = require('fs'); ////necesaria para generara directorios

const passport=require('passport');
const cookieParser=require('cookie-parser');
const session=require('express-session');
const PassportLocal =require('passport-local').Strategy;


const bcrypt = require('bcrypt');
const saltRounds = 10;

const {MongoClient} = require('mongodb');
const res = require('express/lib/response');

//lectura del connetionstring del cluster en mongodb usando el arhivo passwordtxt
const fs2 = require("fs");
const passFile = "password.txt";
const readFile = function (file) {
    return fs2.readFileSync(file).toString();
};
const uri = readFile(passFile);


const client = new MongoClient(uri);
var rimraf = require("rimraf");

//body parser para leer los posts enviados
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended:true}))

app.use(cookieParser('mi ultra hiper secreto'));

app.use(session({
    secret:'mi ultra hiper secreto',
    resave:true,
    saveUninitialized:true
}));

app.use (passport.initialize());
app.use(passport.session());


passport.use(new PassportLocal(function(username,password,done){
    return verificar_usuario(username,password,done)
}));

async function verificar_usuario(username,password,done){
    const res=await obtener_usuario(username);
    try{
        const bcrpass=await bcrypt.compare(password, res.password);
        if (username===res.usuario&&bcrpass){ 
            console.log("contraseña y usuario coinciden");
            return done(null,{id:res._id,name:res.nombre});
        }else{
            console.log("no hay match en constraseñas");
            return done (null,false);
        }
    }catch{
        console.log("no existe el usuario");
        return done (null,false);
    }
}

passport.serializeUser(function(user,done){
    done(null,user.id);
})

passport.deserializeUser(function(id,done){
    done(null,{id:1,name:"Fabian"});
})

async function obtener_usuario(username){
    try {
        await conectarBase();
        const rec=await client.db("MAPB").collection("usuarios").findOne({usuario:username});
        // console.log(rec)
        return rec;
       
    } catch (e) {
        console.error(e);
    }
    finally{
        await client.close();
        console.log("conexion base cerrada");
    }
}

//metodo de conexion
async function con() {
    try {
        await client.connect();
        console.log("conectado a MongoDB atlas");
        // await listDatabases(client);
     
    } catch (e) {
        console.error(e);
    }
}
//pide conectar a la base
async function conectarBase(client, newListings){
    await con().catch(console.error);
}
//metodo de insertar recorrido
async function insert(client, data){
    try {
        await conectarBase();
        const result = await client.db("MAPB").collection("tours").insertOne(data);
        console.log(`Recorrido creado con el id:`+result.insertedId);
        return (result.insertedId);
    } catch (e) {
        console.error(e);
    }
    finally {
        await client.close();
        console.log("conexion base cerrada");
    }
}
//inserta los datos del recorrido
async function call_insert(res,rec){
    const id=await insert(client,rec)
    await crear_dir(id); //crea el directorio con el id del rec insertado
    await res.send(id);
}
//utiliza los css y sripts
// app.use(express.static(__dirname + '/'));
app.use("/public",express.static(__dirname+'/public'));
app.use("/assets",express.static(__dirname+'/assets'));

// //define la primera pagina html
// app.get('/', (req, res) => {
//     res.sendFile('loguin.html',{root: __dirname});
// });
//define la primera pagina html
app.get('/', (req, res,next) => {
    if(req.isAuthenticated())return next();
    res.redirect("/loguin");
},(req,res)=>{
    res.redirect("/buscar");
});

// conecta la pagina crear
app.get('/buscar', (req, res,next) => {
    if(req.isAuthenticated())return next();
    res.redirect("/loguin");
},(req,res)=>{
    res.sendFile('buscar.html',{root: __dirname});
});

app.get('/loguin', (req, res) => {
    //    res.render("loguin")
       res.sendFile('loguin.html',{root: __dirname});
});

app.post('/loguin',passport.authenticate('local', { failureRedirect: '/loguin' }),  function(req, res) {
    console.log(req.user);
	res.redirect('/');
});

//conecta la pagina crear
app.get('/crear', (req, res,next) => {
    if(req.isAuthenticated())return next();
    res.redirect("/loguin");
},(req,res)=>{
    res.sendFile('crear.html',{root: __dirname});
});


//conecta la pagina visualizador
app.get('/visualizador', (req, res) => {
    res.sendFile('visualizador.html',{root: __dirname});
});

//conecta la pagina editar
app.get('/editar', (req, res,next) => {
    if(req.isAuthenticated())return next();
    res.redirect("/loguin");
},(req,res)=>{
    res.sendFile('editar.html',{root: __dirname});
});

//midelware para escuchar cargas y guardar archivos usando multer
// const multer = require('multer');
// const fileStorageEngine= multer.diskStorage({
//     destination: (req,file, cb) => {
//         cb(null,"./public/recorridos")
//     },
//     filename:(req,file,cb) =>{
//         cb(null,file.originalname);
//     },
// });

// const upload = multer({storage:fileStorageEngine});

//sube las imagenes usando un midelware upload(multer)
// app.post("/multiple",upload.array("images",80),(req,res)=>{
//     res.status(204).send();  
// })


const multer = require('multer')
const storage = multer.diskStorage({
destination: (req, file, cb) => {
   const  nameId  = req.body.name
  const dir = './public/recorridos/'+nameId
  fs.exists(dir, exist => {
  if (!exist) {
    return fs.mkdir(dir, error => cb(error, dir))
  }
  return cb(null, dir)
  })
},
filename: (req, file, cb) => {
  cb(null, file.originalname)
}
})

const upload = multer({ storage });


app.post("/multiple",upload.array("files",80),(req,res)=>{
    console.log(req.body);
    console.log(req.files);
    res.send("UPLOADED");  
})

async function crear_dir(id_rec){

    var dir = './public/recorridos/'+id_rec;
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
       console.log("directorio "+id_rec+" creado");
    }
}



//recibe el recorrido como json para insertarlo
app.post('/json_data',jsonParser, (req, res) => {
    const json_file=req.body.jsonString;//agregar el nombre de la variable enviada para quitar formato de envio nom:dato
    // console.log(json_file);
    const rec_parse=JSON.parse(json_file);
    call_insert(res,rec_parse);
});
//busca en la base los rec por clientes
app.post('/search',jsonParser, async function (req, res) {
    res.send( await search_rec(client,(req.body.text_bus)));
});
//metodo de buscar rec por clientes
async function search_rec(client,name_cli){
    try {
        await conectarBase();
        const r=await client.db("MAPB").collection("tours").find({cliente:name_cli}).project({cliente:1,nombre:1});
        const array_rec=await r.toArray();
            // for (let index = 0; index < array_rec.length; index++) {
            //     console.log("------------- Documento "+index+" ------------------"); 
            //     console.log(array_rec[index]);
            //     console.log("-------------_____________________------------------"); 
            // }
        return array_rec;
       
    } catch (e) {
        console.error(e);
    }finally{
        await client.close();
        console.log("conexion base cerrada");
    }
}
//obtiene el rec por id para el editar y el visulizador
app.post('/obtner_rec',jsonParser, async function (req, res) {
    res.send( await obtner_rec(client,(req.body.id_rec)));
});
async function obtner_rec (client,id_rec){
    try {
        var ObjectId = require('mongodb').ObjectId; 
        var o_id = new ObjectId(id_rec);
        await conectarBase();
        const rec=await client.db("MAPB").collection("tours").findOne({_id:o_id});
        console.log("recorridos encontrados")
        return rec;
       
    } catch (e) {
        console.error(e);
    }
    finally{
        await client.close();
        console.log("conexion base cerrada");
    }
}
//actualiza los datos del recorrido
app.post('/update_data',jsonParser,async function (req, res){
    const json_fileU=req.body.jsonString;
    const rec=JSON.parse(json_fileU);
    const id=rec.id_rec
    delete rec ['id_rec'];
    console.log(rec);
    console.log(id);
    res.send(await actualizar_rec(client,id,rec));
});
//metodo de actualizacion en la base
async function actualizar_rec (client,id,rec){
    try {
        var ObjectId = require('mongodb').ObjectId; 
        var o_id = new ObjectId(id);
        await conectarBase();
        var myquery = { _id: o_id };

        var newvalues = { $set: 
            {cliente:rec.cliente,
            scene:rec.scene,
            icon_hotspot:rec.icon_hotspot,
            icon_infospot:rec.icon_infospot,
            nombre:rec.nombre } 
        };
        await client.db("MAPB").collection("tours").updateOne(myquery, newvalues );
      
       
    } catch (e) {
        console.error(e);
    }
    finally{
        await client.close();
        console.log("conexion base cerrada");
    }
}
//obtner todos los clientes de los recorridos sin repetir informacion
app.post('/get_clients',jsonParser, async function (req, res) {
    res.send( await obtner_clientes(client));
});
//metodo de obtner clientes
async function obtner_clientes (){
    try {
        await conectarBase();
        const cli=await client.db("MAPB").collection("tours").distinct("cliente");
        console.log("clientes encontrados");
        return cli;
    } catch (e) {
        console.error(e);
    }
    finally{
        await client.close();
        console.log("conexion base cerrada");
    }
}
//borrar recorrido
app.post('/borrar',jsonParser, async function (req, res) {
    const id_recorrido=req.body.id_recorrido;
    await borrar_dir(id_recorrido);
    res.send( await borrar_rec(client,id_recorrido));
});
async function borrar_dir(id_recorrido){
    try{
    rimraf("./public/recorridos/"+id_recorrido, function () { console.log("delete done"); });
    }catch{
        console.log("no se puudo borrar el directorio")
    }
}
//metodo de borrar recorrido
async function borrar_rec(client,id){
    try {
        console.log(id)
        var ObjectId = require('mongodb').ObjectId; 
        var o_id = new ObjectId(id);
        var myquery = {_id: o_id };
        await conectarBase();
        const r= await client.db("MAPB").collection("tours").deleteOne(myquery);
        return r;
    } catch (e) {
        console.error(e);
    }
    finally{
        await client.close();
        console.log("conexion base cerrada");
    }
}

//escucha el puerto
app.listen(port, () => {
   console.log('puerto '+port+' levantado');
});



