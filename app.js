const express = require("express");

const mysql = require("mysql");

const util = require("util");

const app = express();

var conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "biblioteca",
});

const qy = util.promisify(conexion.query).bind(conexion); // permite el uso de async-await en la conexion con mysql

conexion.connect((error) => {
  if (error) {
    throw error;
  }
  console.log("Conexión con la base de datos establecida");
});

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

      // si pasó chequeos de que no falten datos y que la categoria no exista previamente
      //procede la creación de la categoria

      query = "INSERT INTO categorias (categorias_nombre) VALUES (?)";
      respuesta = await qy(query, [req.body.nombre.toUpperCase()]);
      res.send({ id: respuesta.insertId, nombre: req.body.nombre.toUpperCase() });
      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.post /categoria
); // fin de app.post /categoria

app.get(
  "/categoria",
  async (req, res) => {
    /*   retorna: status 200  y [{id:numerico, nombre:string}]  - status: 413 y [] */
    try {
      const query = "SELECT * FROM categorias";
      const respuesta = await qy(query);

      //transformamos categorias_id en id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "id", Object.getOwnPropertyDescriptor(o, "categorias_id"));
        delete o["categorias_id"];
      });

      //transformamos categorias_nombre en nombre
      respuesta.forEach((o) => {
        Object.defineProperty(o, "nombre", Object.getOwnPropertyDescriptor(o, "categorias_nombre"));
        delete o["categorias_nombre"];
      });

      res.send(respuesta);

      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.get /categoria
); //fin de app.get/categoria

app.get(
  "/categoria/:id",
  async (req, res) => {
    /* retorna: status 200 y {id: numerico, nombre:string} - status: 413, {mensaje: <descripcion del error>} que puede ser: "error inesperado", "categoria no encontrada"
     */

    try {
      // verificar que la categoria existe y lanzar error si no

      const query = "SELECT * FROM categorias WHERE categorias_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No existe ese id de categoría");
      }
      //transformamos categorias_id en id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "id", Object.getOwnPropertyDescriptor(o, "categorias_id"));
        delete o["categorias_id"];
      });

      //transformamos categorias_nombre en nombre
      respuesta.forEach((o) => {
        Object.defineProperty(o, "nombre", Object.getOwnPropertyDescriptor(o, "categorias_nombre"));
        delete o["categorias_nombre"];
      });

      res.send(respuesta);

      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } // fin de callback de app.get /categoria/:id
); //fin de app.get /categoria/:id

app.delete(
  "/categoria/:id",
  async (req, res) => {
    /* retorna: status 200 y {mensaje: "se borro correctamente"} - 
  status: 413, {mensaje: <descripcion del error>} que puese ser: 
  "error inesperado", "categoria con libros asociados, no se puede eliminar", 
  "no existe la categoria indicada"
   */

    try {
      // chequeo si hay libros asociados
      let query = "SELECT * FROM libros WHERE libros_categoria_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length > 0) {
        throw new Error("Esta categoria tiene libros asociados y no se puede borrar");
      }

      // chequeo si existe la categoría
      query = "SELECT * FROM categorias WHERE categorias_id = ?";
      respuesta = await qy(query, [req.params.id]);

      if (respuesta.length == 0) {
        throw new Error("Esta categoria no existe");
      }

      // si pasó chequeos de libros asociados y existencia de la categoria procede el borrado

      query = "DELETE FROM categorias WHERE categorias_id = ?";
      respuesta = await qy(query, [req.params.id]);
      res.status(200).send({ "Se borró correctamente": respuesta.affectedRows });
      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.delete
); // fin de app.delete

/* No se debe implementar el put */

/* PERSONA */

app.post("/persona", async (req, res) => {
  /*  recibe: {nombre: string, apellido: string, alias: string, email: string} 
  retorna: status: 200, {id: numerico, nombre: string, apellido: string, alias: string, email: string}
   - status: 413, {mensaje: <descripcion del error>} que puede ser: "faltan datos", 
   "el email ya se encuentra registrado", "error inesperado"
   */

  try {
    // verificar que no haya nulos

    if (!req.body.nombre || !req.body.apellido || !req.body.email) {
      throw new Error("Faltan datos: nombre y/o apellido y/o email son nulos");
    }

    //verificar que el email no se encuentre ya registrado

    let query = "SELECT * FROM prestatarios WHERE prestatarios_email = ?";
    let respuesta = await qy(query, [req.body.email.toUpperCase()]);
    if (respuesta.length > 0) {
      throw new Error("El email ya se encuentra registrado");
    }

    // verificado que no haya nulos y el registro no exista previamente, procede su inserción

    query =
      "INSERT INTO prestatarios (prestatarios_nombre, prestatarios_apellido, prestatarios_email, prestatarios_alias) values ( ?, ?, ?, ?)";
    respuesta = await qy(query, [
      req.body.nombre.toUpperCase(),
      req.body.apellido.toUpperCase(),
      req.body.email.toUpperCase(),
      req.body.alias.toUpperCase(),
    ]);

    // hecha la inserción, recupero los datos con el id asignado

    query = "SELECT * FROM prestatarios WHERE prestatarios_email = ?";
    respuesta = await qy(query, [req.body.email.toUpperCase()]);

    // transformo los nombres del JSON a los nombres requeridos por las especificaciones

    //transformamos prestatarios_nombre en nombre
    respuesta.forEach((o) => {
      Object.defineProperty(o, "nombre", Object.getOwnPropertyDescriptor(o, "prestatarios_nombre"));
      delete o["prestatarios_nombre"];
    });

    //transformamos prestatarios_apellido en apellido
    respuesta.forEach((o) => {
      Object.defineProperty(o, "apellido", Object.getOwnPropertyDescriptor(o, "prestatarios_apellido"));
      delete o["prestatarios_apellido"];
    });

    //transformamos prestatarios_alias en alias
    respuesta.forEach((o) => {
      Object.defineProperty(o, "alias", Object.getOwnPropertyDescriptor(o, "prestatarios_alias"));
      delete o["prestatarios_alias"];
    });

    //transformamos prestatarios_email en email
    respuesta.forEach((o) => {
      Object.defineProperty(o, "email", Object.getOwnPropertyDescriptor(o, "prestatarios_email"));
      delete o["prestatarios_email"];
    });

    //transformamos prestatarios_id en id
    respuesta.forEach((o) => {
      Object.defineProperty(o, "id", Object.getOwnPropertyDescriptor(o, "prestatarios_id"));
      delete o["prestatarios_id"];
    });

    // envío la respuesta

    res.send(respuesta);

    //fin de try
  } catch (e) {
    console.error(e.message);
    res.status(413).send({ Error: e.message });
  } //fin de catch
});

app.get("/persona", async (req, res) => {
  /*  retorna status 200 y [{id: numerico, nombre: string, apellido: string, alias: string, 
    email; string}] o bien status 413 y [] */
  try {
    let query = "SELECT * FROM prestatarios";
    let respuesta = await qy(query);

    if (respuesta.length != 0) {
      //transformamos prestatarios_id en id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "id", Object.getOwnPropertyDescriptor(o, "prestatarios_id"));
        delete o["prestatarios_id"];
      });

      //transformamos prestatarios_nombre en nombre
      respuesta.forEach((o) => {
        Object.defineProperty(o, "nombre", Object.getOwnPropertyDescriptor(o, "prestatarios_nombre"));
        delete o["prestatarios_nombre"];
      });

      //transformamos prestatarios_apellido en apellido
      respuesta.forEach((o) => {
        Object.defineProperty(o, "apellido", Object.getOwnPropertyDescriptor(o, "prestatarios_apellido"));
        delete o["prestatarios_apellido"];
      });

      //transformamos prestatarios_alias en alias
      respuesta.forEach((o) => {
        Object.defineProperty(o, "alias", Object.getOwnPropertyDescriptor(o, "prestatarios_alias"));
        delete o["prestatarios_alias"];
      });

      //transformamos prestatarios_email en email
      respuesta.forEach((o) => {
        Object.defineProperty(o, "email", Object.getOwnPropertyDescriptor(o, "prestatarios_email"));
        delete o["prestatarios_email"];
      });

      res.send(respuesta);
    } //fin de if respuesta.length != 0
    else {
      //si length de respuesta == 0 envío status 413 + array vacío (respuesta)
      res.status(413).send(respuesta);
    }

    //fin de try
  } catch (e) {
    console.error(e.message);
    res.status(413).send({ Error: e.message });
  } //fin de catch
});

app.get("/persona/:id", async (req, res) => {
  /*  retorna status 200 y {id: numerico, nombre: string, apellido: string, alias: string, email; string} - 
  status 413 , {mensaje: <descripcion del error>} "error inesperado", 
  "no se encuentra esa persona"
   */

  try {
    //verificar que la persona existe

    let query = "SELECT * FROM prestatarios WHERE prestatarios_id = ?";
    let respuesta = await qy(query, [req.params.id]);
    if (respuesta.length == 0) {
      throw new Error("No se encuentra esa persona");
    }

    // Si la persona existe procede enviar los datos

    // Convierte los datos en el formato solicitado

    //transformamos prestatarios_id en id
    respuesta.forEach((o) => {
      Object.defineProperty(o, "id", Object.getOwnPropertyDescriptor(o, "prestatarios_id"));
      delete o["prestatarios_id"];
    });

    //transformamos prestatarios_nombre en nombre
    respuesta.forEach((o) => {
      Object.defineProperty(o, "nombre", Object.getOwnPropertyDescriptor(o, "prestatarios_nombre"));
      delete o["prestatarios_nombre"];
    });

    //transformamos prestatarios_apellido en apellido
    respuesta.forEach((o) => {
      Object.defineProperty(o, "apellido", Object.getOwnPropertyDescriptor(o, "prestatarios_apellido"));
      delete o["prestatarios_apellido"];
    });

    //transformamos prestatarios_alias en alias
    respuesta.forEach((o) => {
      Object.defineProperty(o, "alias", Object.getOwnPropertyDescriptor(o, "prestatarios_alias"));
      delete o["prestatarios_alias"];
    });

    //transformamos prestatarios_email en email
    respuesta.forEach((o) => {
      Object.defineProperty(o, "email", Object.getOwnPropertyDescriptor(o, "prestatarios_email"));
      delete o["prestatarios_email"];
    });

    // Envía los datos
    res.send(respuesta);
    //fin de try
  } catch (e) {
    console.error(e.message);
    res.status(413).send({ Error: e.message });
  } //fin de catch
});

app.put(
  "/persona/:id",
  async (req, res) => {
    /*  recibe: {nombre: string, apellido: string, alias: string, email: string} 
  el email no se puede modificar. retorna status 200 y el objeto modificado 
  o bien status 413, {mensaje: <descripcion del error>} 
  "error inesperado", "no se encuentra esa persona"
   */

    try {
      //verifica que no haya datos nulos en los campos requeridos

      if (!req.body.nombre || !req.body.apellido) {
        throw new Error("Datos nulos en campos requeridos nombre y/o apellido");
      }

      //verifica que el id existe

      let query = "SELECT * FROM prestatarios WHERE prestatarios_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No se encuentra esa persona");
      }

      // una vez verificado que no haya campos nulos y que el id existe procede actualizar

      query =
        "UPDATE prestatarios SET prestatarios_nombre = ?, prestatarios_apellido = ?, prestatarios_alias = ? WHERE prestatarios_id = ?";
      respuesta = await qy(query, [
        req.body.nombre.toUpperCase(),
        req.body.apellido.toUpperCase(),
        req.body.alias.toUpperCase(),
        req.params.id,
      ]);
      //console.log({ respuesta: respuesta.affectedRows });

      query = "SELECT * FROM prestatarios WHERE prestatarios_id = ?";
      respuesta = await qy(query, [req.params.id]);

      //transformamos prestatarios_nombre en nombre
      respuesta.forEach((o) => {
        Object.defineProperty(o, "nombre", Object.getOwnPropertyDescriptor(o, "prestatarios_nombre"));
        delete o["prestatarios_nombre"];
      });

      //transformamos prestatarios_apellido en apellido
      respuesta.forEach((o) => {
        Object.defineProperty(o, "apellido", Object.getOwnPropertyDescriptor(o, "prestatarios_apellido"));
        delete o["prestatarios_apellido"];
      });

      //transformamos prestatarios_alias en alias
      respuesta.forEach((o) => {
        Object.defineProperty(o, "alias", Object.getOwnPropertyDescriptor(o, "prestatarios_alias"));
        delete o["prestatarios_alias"];
      });

      //transformamos prestatarios_email en email
      respuesta.forEach((o) => {
        Object.defineProperty(o, "email", Object.getOwnPropertyDescriptor(o, "prestatarios_email"));
        delete o["prestatarios_email"];
      });

      //transformamos prestatarios_id en id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "id", Object.getOwnPropertyDescriptor(o, "prestatarios_id"));
        delete o["prestatarios_id"];
      });

      res.send(respuesta);
      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.put /persona
); //fin de app.put /persona

app.delete(
  "/persona/:id",
  async (req, res) => {
    /* retorna: 200 y {mensaje: "se borro correctamente"} 
  o bien 413, {mensaje: <descripcion del error>} "error inesperado", "no existe esa persona", 
  "esa persona tiene libros asociados, no se puede eliminar"
   */
    try {
      // verifico si existe la persona
      let query = "SELECT * FROM prestatarios WHERE prestatarios_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No existe esa persona");
      }
      // verifico si tiene libros prestados
      query = "SELECT * FROM libros WHERE libros_prestatario_id = ?";
      respuesta = await qy(query, [req.params.id]);

      if (respuesta.length > 0) {
        throw new Error("Esa persona tiene libros asociados, no se puede eliminar");
      }

      // Si la persona existe y no tiene libros prestados, procede la eliminación
      query = "DELETE FROM prestatarios WHERE prestatarios_id = ?";
      respuesta = await qy(query, [req.params.id]);

      res.send({ mensaje: "Se borró correctamente" });

      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.delete /persona/:id
); //fin de app.delete /persona/:id

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
    try {
      //verificar que no ingresen campos nulos (nombre y categoría)
      if (!req.body.nombre || !req.body.categoria_id) {
        throw new Error("Nombre y categoría son datos obligatorios");
      }
      //verificar que no exista el libro previamente

      let query = "SELECT * FROM libros WHERE libros_nombre = ?";
      let respuesta = await qy(query, [req.body.nombre.toUpperCase()]);
      if (respuesta.length > 0) {
        throw new Error("Ese libro ya existe");
      }

      //verificar que exista la categoría

      query = "SELECT * FROM categorias WHERE categorias_id = ?";
      respuesta = await qy(query, [req.body.categoria_id]);
      if (respuesta.length == 0) {
        throw new Error("No existe la categoria indicada");
      }

      // Si no hay campos nulos ni existe previamente y la categoría existe,
      //procede insertar el registro
      query = "INSERT INTO libros (libros_nombre, libros_descripcion, libros_categoria_id) VALUES (?,?,?)";
      respuesta = await qy(query, [
        req.body.nombre.toUpperCase(),
        req.body.descripcion.toUpperCase(),
        req.body.categoria_id,
      ]);

      let identificador = respuesta.insertId;

      //prepara los datos que serán enviados como respuesta

      query = "SELECT * FROM libros WHERE libros_id = ?";
      respuesta = await qy(query, [identificador]);

      //transformamos libros_id en id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "id", Object.getOwnPropertyDescriptor(o, "libros_id"));
        delete o["libros_id"];
      });

      //transformamos libros_nombre en nombre
      respuesta.forEach((o) => {
        Object.defineProperty(o, "nombre", Object.getOwnPropertyDescriptor(o, "libros_nombre"));
        delete o["libros_nombre"];
      });

      //transformamos libros_descripcion en descripcion
      respuesta.forEach((o) => {
        Object.defineProperty(o, "descripcion", Object.getOwnPropertyDescriptor(o, "libros_descripcion"));
        delete o["libros_descripcion"];
      });

      //transformamos libros_categoria_id en categoria_id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "categoria_id", Object.getOwnPropertyDescriptor(o, "libros_categoria_id"));
        delete o["libros_categoria_id"];
      });

      //transformamos libros_prestatario_id en persona_id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "persona_id", Object.getOwnPropertyDescriptor(o, "libros_prestatario_id"));
        delete o["libros_prestatario_id"];
      });

      res.send(respuesta);

      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.post /libro
); //fin de app.post /libro

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
        //transformamos libros_id en id
        respuesta.forEach((o) => {
          Object.defineProperty(o, "id", Object.getOwnPropertyDescriptor(o, "libros_id"));
          delete o["libros_id"];
        });

        //transformamos libros_nombre en nombre
        respuesta.forEach((o) => {
          Object.defineProperty(o, "nombre", Object.getOwnPropertyDescriptor(o, "libros_nombre"));
          delete o["libros_nombre"];
        });

        //transformamos libros_descripcion en descripcion
        respuesta.forEach((o) => {
          Object.defineProperty(o, "descripcion", Object.getOwnPropertyDescriptor(o, "libros_descripcion"));
          delete o["libros_descripcion"];
        });

        //transformamos libros_categoria_id en categoria_id
        respuesta.forEach((o) => {
          Object.defineProperty(o, "categoria_id", Object.getOwnPropertyDescriptor(o, "libros_categoria_id"));
          delete o["libros_categoria_id"];
        });

        //transformamos libros_prestatario_id en persona_id
        respuesta.forEach((o) => {
          Object.defineProperty(o, "persona_id", Object.getOwnPropertyDescriptor(o, "libros_prestatario_id"));
          delete o["libros_prestatario_id"];
        });

        res.send(respuesta);
      } //fin de if respuesta.length != 0
      else {
        //si length de respuesta == 0 envío status 413 + array vacío (respuesta)
        res.status(413).send(respuesta);
      }

      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.get /libro
); //fin de app.get /libro

app.get(
  "/libro/:id",
  async (req, res) => {
    /*  devuelve 200 {id: numero, nombre:string, descripcion:string, categoria_id:numero, 
      persona_id:numero/null} y 
      status 413, {mensaje: <descripcion del error>} "error inesperado", 
      "no se encuentra ese libro"

 */
    try {
      // verificar que el libro existe y lanzar error si no

      let query = "SELECT * FROM libros WHERE libros_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No se encuentra ese libro");
      }

      //Si el libro existe procede enviar la respuesta

      //transformamos libros_id en id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "id", Object.getOwnPropertyDescriptor(o, "libros_id"));
        delete o["libros_id"];
      });

      //transformamos libros_nombre en nombre
      respuesta.forEach((o) => {
        Object.defineProperty(o, "nombre", Object.getOwnPropertyDescriptor(o, "libros_nombre"));
        delete o["libros_nombre"];
      });

      //transformamos libros_descripcion en descripcion
      respuesta.forEach((o) => {
        Object.defineProperty(o, "descripcion", Object.getOwnPropertyDescriptor(o, "libros_descripcion"));
        delete o["libros_descripcion"];
      });

      //transformamos libros_categoria_id en categoria_id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "categoria_id", Object.getOwnPropertyDescriptor(o, "libros_categoria_id"));
        delete o["libros_categoria_id"];
      });

      //transformamos libros_prestatario_id en persona_id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "persona_id", Object.getOwnPropertyDescriptor(o, "libros_prestatario_id"));
        delete o["libros_prestatario_id"];
      });

      res.send(respuesta);

      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.gett /libro/:id
); //fin de app.gett /libro/:id

app.put(
  "/libro/:id",
  async (req, res) => {
    /*  y {id: numero, nombre:string, descripcion:string, categoria_id:numero, 
    persona_id:numero/null} devuelve status 200 y {id: numero, nombre:string, 
      descripcion:string, categoria_id:numero, persona_id:numero/null} modificado 
      o bien status 413, {mensaje: <descripcion del error>} "error inesperado",  
      "solo se puede modificar la descripcion del libro
   */
    try {
      //verificar que el libro existe
      let query = "SELECT * FROM libros WHERE libros_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No se encuentra ese libro");
      }

      //verificar que el nombre y categoria recibidos son nulos,
      //ya que sólo se puede cambiar la descripcion

      if (req.body.nombre || req.body.categoria || req.body.persona_id) {
        throw new Error(
          "Sólo se puede modificar la descripción del libro, campos nombre, categoría_id y persona_id deben ser nulos"
        );
      }

      //Si el libro existe y nombre/categoría son nulos, procede la modificación (de la descripción)

      query = "UPDATE libros SET libros_descripcion = ? WHERE libros_id = ?";
      respuesta = await qy(query, [req.body.descripcion.toUpperCase(), req.params.id]);

      //preparar la respuesta

      query = "SELECT * FROM libros WHERE libros_id = ?";
      respuesta = await qy(query, [req.params.id]);

      //transformamos libros_id en id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "id", Object.getOwnPropertyDescriptor(o, "libros_id"));
        delete o["libros_id"];
      });

      //transformamos libros_nombre en nombre
      respuesta.forEach((o) => {
        Object.defineProperty(o, "nombre", Object.getOwnPropertyDescriptor(o, "libros_nombre"));
        delete o["libros_nombre"];
      });

      //transformamos libros_descripcion en descripcion
      respuesta.forEach((o) => {
        Object.defineProperty(o, "descripcion", Object.getOwnPropertyDescriptor(o, "libros_descripcion"));
        delete o["libros_descripcion"];
      });

      //transformamos libros_categoria_id en categoria_id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "categoria_id", Object.getOwnPropertyDescriptor(o, "libros_categoria_id"));
        delete o["libros_categoria_id"];
      });

      //transformamos libros_prestatario_id en persona_id
      respuesta.forEach((o) => {
        Object.defineProperty(o, "persona_id", Object.getOwnPropertyDescriptor(o, "libros_prestatario_id"));
        delete o["libros_prestatario_id"];
      });

      res.send(respuesta);
      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.put /libro/:id
); //fin de app.put /libro/:id

app.put(
  "/libro/prestar/:id",
  async (req, res) => {
    /* y {id:numero, persona_id:numero} devuelve 200 y {mensaje: "se presto correctamente"} 
  o bien status 413, {mensaje: <descripcion del error>} "error inesperado", 
  "el libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva", 
  "no se encontro el libro", "no se encontro la persona a la que se quiere prestar el libro"
   */

    try {
      // verificar que no haya campos nulos

      if (!req.params.id || !req.body.persona_id) {
        throw new Error("Alguno de los parámetros requeridos es nulo");
      }

      //verificar que el libro existe

      let query = "SELECT * FROM libros WHERE libros_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No se encontró el libro");
      }
      // verificar que el libro no se encuentra prestado
      if (respuesta[0].libros_prestatario_id != null) {
        throw new Error("El libro ya está prestado");
      }

      //verificar que existe la persona a la que se le prestará
      query = "SELECT * FROM prestatarios WHERE prestatarios_id = ?";

      respuesta = await qy(query, [req.body.persona_id]);
      if (respuesta.length == 0) {
        throw new Error("No se encontró la persona a la que se quiere prestar el libro");
      }

      // Si no se detectaron errores, procede el préstamo

      query = "UPDATE libros SET libros_prestatario_id = ? WHERE libros_id = ?";

      respuesta = await qy(query, [req.body.persona_id, req.params.id]);

      res.send({ mensaje: "se prestó correctamente" });

      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.put /libro/prestar/:id
); //fin de app.put /libro/prestar/:id

app.put(
  "/libro/devolver/:id",
  async (req, res) => {
    /*  y {} devuelve 200 y {mensaje: "se realizo la devolucion correctamente"} 
  o bien status 413, {mensaje: <descripcion del error>} "error inesperado", 
  "ese libro no estaba prestado!", "ese libro no existe"
   */

    try {
      //verificar que existe
      let query = "SELECT * FROM libros WHERE libros_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("Ese libro no existe");
      }

      //verificar que esté prestado

      if (respuesta[0].libros_prestatario_id == null) {
        throw new Error("¡Ese libro no estaba prestado!");
      }

      //si existe y está prestado procede la devolución

      query = "UPDATE libros SET libros_prestatario_id = null WHERE libros_id = ?";
      respuesta = await qy(query, [req.params.id]);
      res.send({ mensaje: "Se realizó la devolución correctamente" });
      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.put/libro/devolver/:id
); //fin de app.put/libro/devolver/:id

app.delete(
  "/libro/:id",
  async (req, res) => {
    /*  devuelve 200 y {mensaje: "se borro correctamente"}  o bien status 413, 
  {mensaje: <descripcion del error>} "error inesperado", "no se encuentra ese libro", 
  "ese libro esta prestado no se puede borrar"
   */
    try {
      //verificar que el libro existe

      let query = "SELECT * FROM libros WHERE libros_id = ?";
      let respuesta = await qy(query, [req.params.id]);
      if (respuesta.length == 0) {
        throw new Error("No se encuentra ese libro");
      }

      //verificar que no esté prestado

      if (respuesta[0].libros_prestatario_id != null) {
        throw new Error("Ese libro está prestado, no se puede borrar");
      }

      //si existe y no está prestado procede la eliminación

      query = "DELETE FROM libros WHERE libros_id = ?";

      respuesta = await qy(query, [req.params.id]);

      res.send({ mensaje: "Se realizó la eliminación correctamente" });

      //fin de try
    } catch (e) {
      console.error(e.message);
      res.status(413).send({ Error: e.message });
    } //fin de catch
  } //fin de callback de app.delete /libro/:id
); //fin de app.delete /libro/:id

app.listen(3000, () => {
  console.log("app escuchando puerto 3000");
});
