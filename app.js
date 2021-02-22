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

conexion.connect();

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.post("/categoria", (req, res) => {
  /*   recibe: {nombre: string} retorna: status: 200, {id: numerico, nombre: string} - status: 413, {mensaje: <descripcion del error>} que puede ser: "faltan datos", "ese nombre de categoria ya existe", "error inesperado" */
});

app.get("/categoria", (req, res) => {
  /*   retorna: status 200  y [{id:numerico, nombre:string}]  - status: 413 y [] */
});

app.get("/categoria/:id", (req, res) => {
  /* retorna: status 200 y {id: numerico, nombre:string} - status: 413, {mensaje: <descripcion del error>} que puede ser: "error inesperado", "categoria no encontrada"
   */
});

app.delete("/categoria/:id", (req, res) => {
  /* retorna: status 200 y {mensaje: "se borro correctamente"} - status: 413, {mensaje: <descripcion del error>} que puese ser: "error inesperado", "categoria con libros asociados, no se puede eliminar", "no existe la categoria indicada"
   */
});

/* No se debe implementar el put */

/* PERSONA */

app.post("/persona", (req, res) => {
  /*  recibe: {nombre: string, apellido: string, alias: string, email: string} retorna: status: 200, {id: numerico, nombre: string, apellido: string, alias: string, email: string} - status: 413, {mensaje: <descripcion del error>} que puede ser: "faltan datos", "el email ya se encuentra registrado", "error inesperado"
   */
});

app.get("/persona", (req, res) => {
  /*  retorna status 200 y [{id: numerico, nombre: string, apellido: string, alias: string, email; string}] o bien status 413 y []

 */
});

app.get("/persona/:id", (req, res) => {
  /*  retorna status 200 y {id: numerico, nombre: string, apellido: string, alias: string, email; string} - status 413 , {mensaje: <descripcion del error>} "error inesperado", "no se encuentra esa persona"
   */
});

app.put("/persona/:id", (req, res) => {
  /*  recibe: {nombre: string, apellido: string, alias: string, email: string} el email no se puede modificar. retorna status 200 y el objeto modificado o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "no se encuentra esa persona"
   */
});

app.delete("/persona/:id", (req, res) => {
  /* retorna: 200 y {mensaje: "se borro correctamente"} o bien 413, {mensaje: <descripcion del error>} "error inesperado", "no existe esa persona", "esa persona tiene libros asociados, no se puede eliminar"
   */
});

/* LIBRO */

app.post("/libro", (req, res) => {
  /*  recibe: {nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} devuelve 200 y {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} o bien status 413,  {mensaje: <descripcion del error>} que puede ser "error inesperado", "ese libro ya existe", "nombre y categoria son datos obligatorios", "no existe la categoria indicada", "no existe la persona indicada"
   */
});

app.get("/libro", (req, res) => {
  /*  devuelve 200 y [{id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null}] o bien 413, {mensaje: <descripcion del error>} "error inesperado"

 */
});

app.get("/libro/:id", (req, res) => {
  /*  devuelve 200 {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} y status 413, {mensaje: <descripcion del error>} "error inesperado", "no se encuentra ese libro"

 */
});

app.put("/libro/:id", (req, res) => {
  /*  y {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} devuelve status 200 y {id: numero, nombre:string, descripcion:string, categoria_id:numero, persona_id:numero/null} modificado o bien status 413, {mensaje: <descripcion del error>} "error inesperado",  "solo se puede modificar la descripcion del libro
   */
});

app.put("/libro/prestar/:id", (req, res) => {
  /* y {id:numero, persona_id:numero} devuelve 200 y {mensaje: "se presto correctamente"} o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "el libro ya se encuentra prestado, no se puede prestar hasta que no se devuelva", "no se encontro el libro", "no se encontro la persona a la que se quiere prestar el libro"
   */
});

app.put("/libro/devolver/:id", (req, res) => {
  /*  y {} devuelve 200 y {mensaje: "se realizo la devolucion correctamente"} o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "ese libro no estaba prestado!", "ese libro no existe"
   */
});

app.delete("/libro/:id", (req, res) => {
  /*  devuelve 200 y {mensaje: "se borro correctamente"}  o bien status 413, {mensaje: <descripcion del error>} "error inesperado", "no se encuentra ese libro", "ese libro esta prestado no se puede borrar"
   */
});

app.listen(3000, () => {
  console.log("app escuchando puerto 3000");
});
