const express = require('express');
const ejs = require('ejs');
const mysql = require('mysql2/promise')
require('dotenv').config(); // read in the .evn file

const app = express();
app.use(express.urlencoded({
    extended: false
  })); // enable forms

  app.get('/recipes/add', function(req, res){
    res.render("newRecipe");
});

// initialise the database
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.set("view engine", "ejs");

app.get("/", function(req,res){
	res.render("home");
});

app.get('/recipes', async function(req,res){
    const [results] = await pool.query('SELECT * FROM recipes');
    res.render("recipes", { recipes: results });
});

app.post('/recipes', async function(req, res){
    const { name, ingredients, instructions } = req.body;
    await pool.query('INSERT INTO recipes (name, ingredients, instructions) VALUES (?, ?, ?)', [name, ingredients, instructions]);
    res.redirect('/recipes');
});
// need a route parameter to know the id of the recipe we are editing
// pool, execute will by using mysql prepareed statement
// result is always an array for select
  // pool.execute will be using MySQL prepared statements
  // pool.execute or pool.query will result in an array if you do a SELECT
  // even if there is only one result
app.get('/recipes/:id/edit', async function(req, res){
    const { id } = req.params;
    const [results] = await pool.query('SELECT * FROM recipes WHERE id = ?', [id]);
    res.render("editRecipe", { recipe: results[0] });
});

app.post('/recipes/:id', async function(req,res){
    // get the id of the recipe we want to create
    const id = req.params.id;
    const {name, ingredients, instructions} = req.body;
    const query = `
    UPDATE recipes 
      SET name=?,
          ingredients=?,
          instructions=?
      WHERE id = ?;
    `;
    await pool.query(query, [name, ingredients, instructions, id]);
    res.redirect("/recipes");
  })

app.get('/recipes/:id/delete', async function(req, res){
    const { id } = req.params;
    await pool.query('DELETE FROM recipes WHERE id = ?', [id]);
    res.redirect('/recipes');
});

// GET - Fetch all reviews
app.get('/api/recipes', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM recipes');
    res.json(rows);
});

// start server
app.listen(8080, function(){
    console.log("Express server has started");
})