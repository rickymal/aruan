
const express = require('express'); //Importanto o modulo express
const routes = require('./routes');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json()); //dizendo o formato do corpo da requisição
app.use(routes)
app.listen(3333);