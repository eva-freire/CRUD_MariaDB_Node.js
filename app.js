const express = require("express");
const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "planning",
  connectionLimit: 5,
});

const app = express();
const port = 3000;

app.use(express.json());

/* Codigo de creacion de tabla To Do:

CREATE TABLE `todo` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`description` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	`created_at` DATE NOT NULL,
	`updated_at` DATE NOT NULL,
	`status` VARCHAR(50) NOT NULL COLLATE 'latin1_swedish_ci',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='latin1_swedish_ci'
ENGINE=InnoDB
AUTO_INCREMENT=5;
*/

app.get("/", (req, res) => {
  res.send("<h1>Bienvenid@ al servidor</h1>");
});

app.get("/todo", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, name, description, created_at, updated_at, status FROM todo;"
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.get("/todo/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query(
      "SELECT id, name, description, created_at, updated_at, status FROM todo WHERE id=?",
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.post("/todo", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const response = await conn.query(
      `INSERT INTO todo (name, description, created_at, updated_at, status) VALUE(?, ?, ?,?,?)`,
      [req.body.name, req.body.description, req.body.created_at, req.body.updated_at, req.body.status]
    );

    res.json({ id: parseInt(response.insertId), ...req.body });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.put("/todo/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const response = await conn.query(
      `UPDATE todo SET name=?, description=?, created_at=?, updated_at=?, status=? WHERE id=?`,
      [req.body.name, req.body.description, req.body.created_at, req.body.updated_at, req.body.status, req.params.id]
    );

    res.json({ id: req.params.id, ...req.body });
    res.status(200).json({message: 'Item updated successfully'})
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.delete("/todo/:id", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("DELETE FROM todo WHERE id=?", [
      req.params.id,
    ]);
    res.json({ message: "Elemento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Se rompió el servidor" });
  } finally {
    if (conn) conn.release(); //release to pool
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

