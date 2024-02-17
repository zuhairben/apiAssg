const connectToMongo = require('./db');
const express = require('express');

connectToMongo();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/auth', require('./routes/auth'));

app.listen(port, ()=>{
    console.log(`Listening at port ${port}` )
})