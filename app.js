const express = require("express");

const mysql = require("mysql");

const util = require("util");

const app = express();

//Estas constantes se declaran para que en caso de un error de tipeo ocurra un error al compilar
const libros = "LIBROS",
  categorias = "CATEGORIAS",
  prestatarios = "PRESTATARIOS";

var conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "biblioteca",
});

// Permite el uso de async-await en la conexión con mysql
const qy = util.promisify(conexion.query).bind(conexion);

conexion.connect((error) => {
  if (error) {
    throw error;
  }
  console.log("Conexión con la base de datos establecida");
});

/*Esta función transforma los nombres internos de los campos de la base de datos
en los nombres requeridos en la consigna */

function adaptaNombresDeKeysAFormatoSalida(datos, tipo) {
  let datosProvisorio = [];
  switch (tipo) {
    case "CATEGORIAS":
      datosProvisorio = datos.map(
        (item) => {
          return { id: item.categorias_id, nombre: item.categorias_nombre }; // Fin de la definición del elemento del array
        } //Fin de arrow function de datos.
      ); //Fin de datos.map

      break; // Fin de case CATEGORIAS
    case "LIBROS":
      datosProvisorio = datos.map(
        (item) => {
          return {
            id: item.libros_id,
            nombre: item.libros_nombre,
            descripcion: item.libros_descripcion,
            categoria_id: item.libros_categoria_id,
            persona_id: item.libros_prestatario_id,
          }; // Fin de la definición del elemento del array
        } //Fin de arrow function de datos.
      ); //Fin de datos.map

      break; // Fin de case LIBROS
    case "PRESTATARIOS":
      datosProvisorio = datos.map(
        (item) => {
          return {
            id: item.prestatarios_id,
            nombre: item.prestatarios_nombre,
            apellido: item.prestatarios_apellido,
            alias: item.prestatarios_alias,
            email: item.prestatarios_email,
          }; //Fin de la definición del elemento del array
        } //Fin de arrow function de datos.map
      ); // Fin de datos.map

      break; //Fin de case PRESTATARIOS
  } //Fin de switch
  return datosProvisorio;
} //Fin de function adaptaNombresDeKeysAFormatoSalida

app.use(express.json());

app.post(
  "/categoria",
  async (req, res) => {
    /*   recibe: {nombre: string} retorna: status: 200, {id: numerico, nombre: string} - 
  status: 413, {mensaje: <descripcion del error>} que puede ser: 
  "faltan datos", "ese nombre de categoria ya existe", "error inesperado" */
    try {
      // verifica que no falten datos
      if (!req.body.nombre) {
        throw new Error("No se definió el nombre");
      }

      // verifica que la categoría no existe

      let query = "SELECT * FROM categorias WHERE categorias_nombre = ?";
      let respuesta = await qy(query, [req.body.nombre.toUpperCase()]);
      if (respuesta.length > 0) {
        throw new Error("Esta categoria ya existe");
      }

      // Si pasó chequeos de que no falten datos y que la categoría no exista previamente
      //procede la creación de la categoría

      query = "INSERT INTO categorias (categorias_nombre) VALUES (?)";
      respuesta = await qy(query, [req.body.nombre.toUpperCase()]);
      res.send({ id: respuesta.insertId, nombre: req.body.nombre.toUpperCase() });
      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.post /categoria
); // fin de app.post /categoria

app.get(
  "/categoria",
  async (req, res) => {
    /*   retorna: status 200  y [{id:numerico, nombre:string}]  - status: 413 y [] */
    try {
      const query = "SELECT * FROM categorias";
      const respuesta = await qy(query);

      //Envía la respuesta
      console.log(adaptaNombresDeKeysAFormatoSalida(respuesta, categorias));
      res.send(adaptaNombresDeKeysAFormatoSalida(respuesta, categorias));

      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.get /categoria
); //Fin de app.get/categoria

app.get(
  "/categoria/:id",
  async (req, res) => {
    /* retorna: status 200 y {id: numerico, nombre:string} - status: 413, {mensaje: <descripcion del error>} que puede ser: "error inesperado", "categoria no encontrada"
     */

    try {
      // verifica que la categoria existe y lanza error si no

      const query = "SELECT * FROM categorias WHERE categorias_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No existe ese id de categoría");
      }

      res.send(adaptaNombresDeKeysAFormatoSalida(respuesta, categorias));

      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } // fin de callback de app.get /categoria/:id
); //Fin de app.get /categoria/:id

app.delete(
  "/categoria/:id",
  async (req, res) => {
    /* retorna: status 200 y {mensaje: "se borro correctamente"} - 
  status: 413, {mensaje: <descripcion del error>} que puese ser: 
  "error inesperado", "categoria con libros asociados, no se puede eliminar", 
  "no existe la categoria indicada"
   */

    try {
      // Verifica si hay libros asociados
      let query = "SELECT * FROM libros WHERE libros_categoria_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length > 0) {
        throw new Error("Esta categoria tiene libros asociados y no se puede borrar");
      }

      // Verifica si existe la categoría
      query = "SELECT * FROM categorias WHERE categorias_id = ?";
      respuesta = await qy(query, [req.params.id]);

      if (respuesta.length == 0) {
        throw new Error("Esta categoria no existe");
      }

      // Si pasó chequeos de libros asociados y existencia de la categoría procede el borrado

      query = "DELETE FROM categorias WHERE categorias_id = ?";
      respuesta = await qy(query, [req.params.id]);
      res.status(200).send({ "Se borró correctamente": respuesta.affectedRows });
      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.delete
); // fin de app.delete

/* No se debe implementar el put */

/* PERSONA */

app.post("/persona", async (req, res) => {
  /*  recibe: {nombre: string, apellido: string, alias: string, email: string} 
  retorna: status: 200, {id: numerico, nombre: string, apellido: string, alias: string, email: string}
   - status: 413, {mensaje: <descripcion del error>} que puede ser: "faltan datos", 
   "el email ya se encuentra registrado", "error inesperado"
   */

  /*
JSON de prueba para copiar y pegar en postman

{"nombre":"Gimena","apellido":"García","alias":"Gimenita","email":"gimena.garcia@gmail.com"}

*/

  try {
    // Verifica que no haya nulos

    if (!req.body.nombre || !req.body.apellido || !req.body.email) {
      throw new Error("Faltan datos: nombre y/o apellido y/o email son nulos");
    }

    //Verifica que el email no se encuentre ya registrado

    let query = "SELECT * FROM prestatarios WHERE prestatarios_email = ?";
    let respuesta = await qy(query, [req.body.email.toUpperCase()]);
    if (respuesta.length > 0) {
      throw new Error("El email ya se encuentra registrado");
    }

    // Verificado que no haya nulos y el registro no exista previamente, procede su inserción

    query =
      "INSERT INTO prestatarios (prestatarios_nombre, prestatarios_apellido, prestatarios_email, prestatarios_alias) values ( ?, ?, ?, ?)";
    respuesta = await qy(query, [
      req.body.nombre.toUpperCase(),
      req.body.apellido.toUpperCase(),
      req.body.email.toUpperCase(),
      req.body.alias.toUpperCase(),
    ]);

    // Hecha la inserción, recupera los datos con el id asignado

    query = "SELECT * FROM prestatarios WHERE prestatarios_email = ?";
    respuesta = await qy(query, [req.body.email.toUpperCase()]);

    // Envía la respuesta

    res.send(adaptaNombresDeKeysAFormatoSalida(respuesta, prestatarios));

    //⇙ Fin de try
  } catch (e) {
    console.error(e.message);
    res.status(413).send({ Error: e.message });
  } //Fin de catch
});

app.get("/persona", async (req, res) => {
  /*  retorna status 200 y [{id: numerico, nombre: string, apellido: string, alias: string, 
    email; string}] o bien status 413 y [] */
  try {
    let query = "SELECT * FROM prestatarios";
    let respuesta = await qy(query);

    if (respuesta.length != 0) {
      res.send(adaptaNombresDeKeysAFormatoSalida(respuesta, prestatarios));
    } //Fin de if respuesta.length != 0
    else {
      //Si length de respuesta == 0 envía status 413 + array vacío (respuesta)
      res.status(413).send(respuesta);
    }

    //⇙ Fin de try
  } catch (e) {
    console.error(e.message);
    res.status(413).send({ Error: e.message });
  } //Fin de catch
});

app.get("/persona/:id", async (req, res) => {
  /*  retorna status 200 y {id: numerico, nombre: string, apellido: string, alias: string, email; string} - 
  status 413 , {mensaje: <descripcion del error>} "error inesperado", 
  "no se encuentra esa persona"
   */

  try {
    //Verifica que la persona existe

    let query = "SELECT * FROM prestatarios WHERE prestatarios_id = ?";
    let respuesta = await qy(query, [req.params.id]);
    if (respuesta.length == 0) {
      throw new Error("No se encuentra esa persona");
    }

    // Si la persona existe procede enviar los datos

    res.send(adaptaNombresDeKeysAFormatoSalida(respuesta, prestatarios));
    //⇙ Fin de try
  } catch (e) {
    console.error(e.message);
    res.status(413).send({ Error: e.message });
  } //Fin de catch
});

app.put(
  "/persona/:id",
  async (req, res) => {
    /*  recibe: {nombre: string, apellido: string, alias: string, email: string} 
  el email no se puede modificar. retorna status 200 y el objeto modificado 
  o bien status 413, {mensaje: <descripcion del error>} 
  "error inesperado", "no se encuentra esa persona"
   */

    /*
   
   JSON para probar desde postman
{"nombre":"Gimena2","apellido":"García2","alias":"gimenita2","email":"gimena.garcia@gmail.com"}

   */

    try {
      //Verifica que no haya datos nulos en los campos requeridos

      if (!req.body.nombre || !req.body.apellido) {
        throw new Error("Datos nulos en campos requeridos nombre y/o apellido");
      }

      //Verifica que el id existe

      let query = "SELECT * FROM prestatarios WHERE prestatarios_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No se encuentra esa persona");
      }

      // Una vez verificado que no haya campos nulos y que el id existe procede actualizar

      query =
        "UPDATE prestatarios SET prestatarios_nombre = ?, prestatarios_apellido = ?, prestatarios_alias = ? WHERE prestatarios_id = ?";
      respuesta = await qy(query, [
        req.body.nombre.toUpperCase(),
        req.body.apellido.toUpperCase(),
        req.body.alias.toUpperCase(),
        req.params.id,
      ]);

      query = "SELECT * FROM prestatarios WHERE prestatarios_id = ?";
      respuesta = await qy(query, [req.params.id]);

      // Envía la respuesta
      res.send(adaptaNombresDeKeysAFormatoSalida(respuesta, prestatarios));
      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.put /persona
); //Fin de app.put /persona

app.delete(
  "/persona/:id",
  async (req, res) => {
    /* retorna: 200 y {mensaje: "se borro correctamente"} 
  o bien 413, {mensaje: <descripcion del error>} "error inesperado", "no existe esa persona", 
  "esa persona tiene libros asociados, no se puede eliminar"
   */
    try {
      // Verifica si existe la persona
      let query = "SELECT * FROM prestatarios WHERE prestatarios_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No existe esa persona");
      }
      // Verifica si tiene libros prestados
      query = "SELECT * FROM libros WHERE libros_prestatario_id = ?";
      respuesta = await qy(query, [req.params.id]);

      if (respuesta.length > 0) {
        throw new Error("Esa persona tiene libros asociados, no se puede eliminar");
      }

      // Si la persona existe y no tiene libros prestados, procede la eliminación
      query = "DELETE FROM prestatarios WHERE prestatarios_id = ?";
      respuesta = await qy(query, [req.params.id]);

      res.send({ mensaje: "Se borró correctamente" });

      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.delete /persona/:id
); //Fin de app.delete /persona/:id

/* LIBRO */

app.post(
  "/libro",
  async (req, res) => {
    /*  recibe: {nombre:string, descripcion:string, categoria_id:numero, 
      
    Esto probablemente sea un error de la consigna  
      
      persona_id:numero/null} 


  devuelve 200 y {id: numero, nombre:string, descripcion:string, categoria_id:numero, 
    persona_id:numero/null} o bien status 413,  {mensaje: <descripcion del error>} que puede 
    ser "error inesperado", "ese libro ya existe", "nombre y categoria son datos obligatorios", 
    "no existe la categoria indicada", 
    
    Esto probablemente sea un error de la consigna
    
    "no existe la persona indicada"
   */
    /*
  JSON para copiar y pegar en postman
  {"nombre":"libro10", "descripcion":"descripcion10", "categoria_id":1} 
  */
    try {
      //Verifica que no ingresen campos nulos (nombre y categoría)
      if (!req.body.nombre || !req.body.categoria_id) {
        throw new Error("Nombre y categoría son datos obligatorios");
      }
      //Verifica que no exista el libro previamente

      let query = "SELECT * FROM libros WHERE libros_nombre = ?";
      let respuesta = await qy(query, [req.body.nombre.toUpperCase()]);
      if (respuesta.length > 0) {
        throw new Error("Ese libro ya existe");
      }

      //Verifica que exista la categoría

      query = "SELECT * FROM categorias WHERE categorias_id = ?";
      respuesta = await qy(query, [req.body.categoria_id]);
      if (respuesta.length == 0) {
        throw new Error("No existe la categoria indicada");
      }

      //Si no hay campos nulos ni existe previamente y la categoría existe,
      //procede insertar el registro
      query = "INSERT INTO libros (libros_nombre, libros_descripcion, libros_categoria_id) VALUES (?,?,?)";
      respuesta = await qy(query, [
        req.body.nombre.toUpperCase(),
        req.body.descripcion.toUpperCase(),
        req.body.categoria_id,
      ]);

      let identificador = respuesta.insertId;

      //Prepara los datos que serán enviados como respuesta

      query = "SELECT * FROM libros WHERE libros_id = ?";
      respuesta = await qy(query, [identificador]);

      //Envía la respuesta
      res.send(adaptaNombresDeKeysAFormatoSalida(respuesta, libros));

      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.post /libro
); //Fin de app.post /libro

app.get(
  "/libro",
  async (req, res) => {
    /*  devuelve 200 y [{id: numero, nombre:string, descripcion:string, 
      categoria_id:numero, persona_id:numero/null}] 
      o bien 413, {mensaje: <descripcion del error>} "error inesperado"
 */
    try {
      let query = "SELECT * FROM libros";
      let respuesta = await qy(query);

      if (respuesta.length != 0) {
        // Envia la respuesta
        res.send(adaptaNombresDeKeysAFormatoSalida(respuesta, libros));
      } //Fin de if respuesta.length != 0
      else {
        //si length de respuesta == 0 envío status 413 + array vacío (respuesta)
        res.status(413).send(respuesta);
      }

      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.get /libro
); //Fin de app.get /libro

app.get(
  "/libro/:id",
  async (req, res) => {
    /*  devuelve 200 {id: numero, nombre:string, descripcion:string, categoria_id:numero, 
      persona_id:numero/null} y 
      status 413, {mensaje: <descripcion del error>} "error inesperado", 
      "no se encuentra ese libro"

 */
    try {
      // Verifica que el libro existe y lanzar error si no

      let query = "SELECT * FROM libros WHERE libros_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No se encuentra ese libro");
      }

      //Si el libro existe procede enviar la respuesta

      res.send(adaptaNombresDeKeysAFormatoSalida(respuesta, libros));

      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.gett /libro/:id
); //Fin de app.gett /libro/:id

app.put(
  "/libro/:id",
  async (req, res) => {
    /*  y {id: numero, nombre:string, descripcion:string, categoria_id:numero, 
    persona_id:numero/null} devuelve status 200 y {id: numero, nombre:string, 
      descripcion:string, categoria_id:numero, persona_id:numero/null} modificado 
      o bien status 413, {mensaje: <descripcion del error>} "error inesperado",  
      "solo se puede modificar la descripcion del libro
   
   JSON para prueba desde postman

   {"id": 7, "nombre":null, "descripcion":"nueva descripcion7", "categoria_id":null, "persona_id":null}
   
      */
    try {
      //Verifica que el libro existe
      let query = "SELECT * FROM libros WHERE libros_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No se encuentra ese libro");
      }

      //Verifica que el nombre y categoría recibidos son nulos,
      //ya que sólo se puede cambiar la descripción

      if (req.body.nombre || req.body.categoria || req.body.persona_id) {
        throw new Error(
          "Sólo se puede modificar la descripción del libro, campos nombre, categoria_id y persona_id deben ser nulos"
        );
      }

      //Si el libro existe y nombre/categoría son nulos, procede la modificación
      //(de la descripción)

      query = "UPDATE libros SET libros_descripcion = ? WHERE libros_id = ?";
      respuesta = await qy(query, [req.body.descripcion.toUpperCase(), req.params.id]);

      //Prepara la respuesta

      query = "SELECT * FROM libros WHERE libros_id = ?";
      respuesta = await qy(query, [req.params.id]);

      //Envía la respuesta
      res.send(adaptaNombresDeKeysAFormatoSalida(respuesta, libros));
      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.put /libro/:id
); //Fin de app.put /libro/:id

app.put(
  "/libro/prestar/:id",
  async (req, res) => {
    /* y {id:numero, persona_id:numero} devuelve 200 y {mensaje: "se presto correctamente"} 
  o bien status 413, {mensaje: <descripcion del error>} "error inesperado", 
  "el libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva", 
  "no se encontro el libro", "no se encontro la persona a la que se quiere prestar el libro"
   */

    try {
      // Verifica que no haya campos nulos

      if (!req.params.id || !req.body.persona_id) {
        throw new Error("Alguno de los parámetros requeridos es nulo");
      }

      //Verifica que el libro existe

      let query = "SELECT * FROM libros WHERE libros_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No se encontró el libro");
      }
      // Verifica que el libro no se encuentra prestado
      if (respuesta[0].libros_prestatario_id != null) {
        throw new Error("El libro ya está prestado");
      }

      //Verifica que existe la persona a la que se le prestará
      query = "SELECT * FROM prestatarios WHERE prestatarios_id = ?";

      respuesta = await qy(query, [req.body.persona_id]);
      if (respuesta.length == 0) {
        throw new Error("No se encontró la persona a la que se quiere prestar el libro");
      }

      // Si no se detectaron errores, procede el préstamo

      query = "UPDATE libros SET libros_prestatario_id = ? WHERE libros_id = ?";

      respuesta = await qy(query, [req.body.persona_id, req.params.id]);

      res.send({ mensaje: "se prestó correctamente" });

      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.put /libro/prestar/:id
); //Fin de app.put /libro/prestar/:id

app.put(
  "/libro/devolver/:id",
  async (req, res) => {
    /*  y {} devuelve 200 y {mensaje: "se realizo la devolucion correctamente"} 
  o bien status 413, {mensaje: <descripcion del error>} "error inesperado", 
  "ese libro no estaba prestado!", "ese libro no existe"
   */

    try {
      //Verifica que existe
      let query = "SELECT * FROM libros WHERE libros_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("Ese libro no existe");
      }

      //Verifica que esté prestado

      if (respuesta[0].libros_prestatario_id == null) {
        throw new Error("¡Ese libro no estaba prestado!");
      }

      //Si existe y está prestado procede la devolución

      query = "UPDATE libros SET libros_prestatario_id = null WHERE libros_id = ?";
      respuesta = await qy(query, [req.params.id]);
      res.send({ mensaje: "Se realizó la devolución correctamente" });
      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.put/libro/devolver/:id
); //Fin de app.put/libro/devolver/:id

app.delete(
  "/libro/:id",
  async (req, res) => {
    /*  devuelve 200 y {mensaje: "se borro correctamente"}  o bien status 413, 
  {mensaje: <descripcion del error>} "error inesperado", "no se encuentra ese libro", 
  "ese libro esta prestado no se puede borrar"
   */
    try {
      //Verifica que el libro existe

      let query = "SELECT * FROM libros WHERE libros_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No se encuentra ese libro");
      }

      //Verifica que no esté prestado

      if (respuesta[0].libros_prestatario_id != null) {
        throw new Error("Ese libro está prestado, no se puede borrar");
      }

      //Si existe y no está prestado procede la eliminación

      query = "DELETE FROM libros WHERE libros_id = ?";

      respuesta = await qy(query, [req.params.id]);

      res.send({ mensaje: "Se realizó la eliminación correctamente" });

      //⇙ Fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //Fin de catch
  } //Fin de callback de app.delete /libro/:id
); //Fin de app.delete /libro/:id

app.listen(3000, () => {
  console.log("app escuchando puerto 3000");
});
