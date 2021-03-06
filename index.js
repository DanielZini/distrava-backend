const express = require('express');
const app = express();
const db = require('./config/db');
const consign = require('consign');

// consign
consign()
    .include('./config/passport.js')
    .then('./config/middlewares.js')
    .then('./api')
    .then('./config/routes.js')
    .into(app)

app.db = db;
app.use(express.static('public/upload'));

app.get('/', (req, res) => {
    res.status(200).send('Meu Backend');
})

app.listen(process.env.PORT || 3000, () =>{
     console.log('Backend foi');
})