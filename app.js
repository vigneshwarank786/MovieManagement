const express = require('express');
const app = express();
const errorMiddleware = require('./middlewares/error');
const cookieParser = require('cookie-parser')
const path = require('path')
const cors=require('cors');
const dotenv = require('dotenv');
dotenv.config({path:path.join(__dirname,"config/config.env")});


app.use(express.json());
app.use(cookieParser());
app.use(cors())
app.use('/uploads', express.static(path.join(__dirname,'uploads') ) )

const auth = require('./routes/auth')
const movies = require('./routes/movies')



app.use('/',auth);
app.use('/',movies);



app.use(errorMiddleware)

module.exports = app;