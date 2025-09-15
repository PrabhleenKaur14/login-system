
const express = require('express');
const path = require('path');
const logger = require('morgan');
const clientSessions = require('client-sessions');
require('dotenv').config();

const authData = require('./modules/auth-service-pg');

const app = express();
const HTTP_PORT = process.env.PORT || 8080;

// EJS with layout helper
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use((req, res, next) => {
  // simple layout helper: inject a function "layout" into res.locals to wrap content
  res.locals.layout = function(viewName, data){
    res.render(viewName, data);
  };
  next();
});

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// sessions
app.use(clientSessions({
  cookieName: "session",
  secret: process.env.SESSION_SECRET || "dev_secret_change_me",
  duration: 20 * 60 * 1000,
  activeDuration: 5 * 60 * 1000
}));

// expose session + current page to templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.page = req.path;
  next();
});

// guard
function ensureLogin(req, res, next){
  if(!req.session.user){ return res.redirect('/login'); }
  next();
}

// routes
app.get('/', (req, res) => res.redirect('/sites'));
app.get('/sites', (req, res) => {
  res.render('site', { title: 'Sites' , body: '' });
});

// placeholder protected routes (swap with your A5 routes)
app.get('/addSite', ensureLogin, (req, res)=> res.send('Add Site (protected route)'));
app.post('/sites/add', ensureLogin, (req, res)=> res.send('Create Site (protected route)'));
app.get('/sites/:id/edit', ensureLogin, (req, res)=> res.send('Edit Site (protected route)'));
app.post('/sites/:id', ensureLogin, (req, res)=> res.send('Update Site (protected route)'));
app.get('/sites/:id/delete', ensureLogin, (req, res)=> res.send('Delete Site (protected route)'));

// auth routes
app.get('/login', (req, res)=> {
  res.render('login', { errorMessage: null, userName: null });
});
app.post('/login', async (req, res)=> {
  try {
    req.body.userAgent = req.get('User-Agent');
    const user = await authData.checkUser(req.body);
    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
    };
    res.redirect('/sites');
  } catch (err){
    res.render('login', { errorMessage: err, userName: req.body.userName });
  }
});

app.get('/register', (req, res)=> {
  res.render('register', { errorMessage: null, successMessage: null, userName: null });
});
app.post('/register', async (req, res)=> {
  try {
    await authData.registerUser(req.body);
    res.render('register', { successMessage: "User created", errorMessage: null, userName: null });
  } catch (err){
    res.render('register', { errorMessage: err, successMessage: null, userName: req.body.userName });
  }
});

app.get('/logout', (req, res)=> {
  req.session.reset();
  res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res)=> {
  res.render('userHistory');
});

// 404
app.use((req, res)=> res.status(404).send("Page Not Found"));

// start
authData.initialize().then(()=> {
  app.listen(HTTP_PORT, ()=> console.log(`app listening on: ${HTTP_PORT}`));
}).catch(err=> {
  console.log("unable to start server:", err);
});