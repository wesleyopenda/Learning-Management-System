if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const fileName = 'users.json'
const fileName2 = 'courses.json'
const fileName3 = 'userCourse.json'
const fs = require('fs');
//const jsonParser = bodyParser.json();
const bodyParser = require('body-parser')


//load data from file
let rawData = fs.readFileSync(fileName);
let rawData2 = fs.readFileSync(fileName2);
let rawData3 = fs.readFileSync(fileName3);
let data = JSON.parse(rawData);
let data2 = JSON.parse(rawData2);
let data3 = JSON.parse(rawData3);

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => data.find(user => user.email === email),
  id => data.find(user => user.id === id)
)

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  //fs.readFileSync(fileName, JSON.stringify(data, null, 2));
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.get('/success', checkNotAuthenticated, (req, res) => {
  res.render('success.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    data.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.post('/logout', (req, res) => {
  req.logOut(function(err){
    if (err) { return next(err)}
    res.redirect('/login')
  })
})

app.post('/assignCourse', (req, res) => {
  try{
      data3.push({
      courseID: req.body.courseID,
      email: req.body.email,
      role: req.body.role,
    })
    //data3.push(req.body);
    fs.writeFileSync(fileName3, JSON.stringify(data3, null, 2));
    res.redirect('/success')

  } catch{
    res.redirect('/index')
  }
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

app.post('/addCourse', (req, res) => {
  try{
      data2.push({
      courseID: req.body.courseID,
      courseName: req.body.courseName,
      instructor: req.body.instructor,
      courseDay: req.body.courseDay,
      courseTime: req.body.courseTime,
    })
    //data2.push(req.body);
    fs.writeFileSync(fileName2, JSON.stringify(data2, null, 2));
    res.redirect('/success')
  }
  catch{
    res.redirect('/index')

  }
})

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)
console.log("Server is listening")