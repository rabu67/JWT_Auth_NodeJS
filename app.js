const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv').config();
const {requireAuth, checkUser} = require('./middlewares/authMiddlewares');//auth middleware

const app = express();

//import routes
const authRoutes = require('./routes/authRoutes');

// middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = process.env.DB_CONNECT;
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(process.env.PORT || 3000))
  .catch((err) => console.log(err));


// routes
app.get('*', checkUser);
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));
app.use(authRoutes);
// app.get('/set_cookie', (req,res) => {
//   res.cookie('newUser', true);
//   res.cookie('isEmp', false, {httpOnly: true});

//   res.send("Cookies created!");
// });
// app.get('/get_cookie', (req,res) => {
//   const cookies = req.cookies;
//   console.log(cookies);
//   res.json(cookies);
// });