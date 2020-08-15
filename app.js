const express = require('express')
const app = express()
const httpServer = require('http').createServer(app)
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const session = require('express-session')
const layout = require('express-ejs-layouts')
const csrf = require('csurf')
const cookieParser = require('cookie-parser')
const MongoDBStore = require('connect-mongodb-session')(session);

const store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: 'sessions'
});

require('dotenv').config()

app.set('view engine', 'ejs')

app.use(express.static(path.join(__dirname, '/public')))
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')))

app.use(cookieParser())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(layout)


app.set('layout', 'layouts/layout')

app.set("layout extractScripts", true)

const configSession = session({
  secret: 'askjhaskdhakhdaskdnkjalfjsdljfslf',
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  store : store
})

app.use(configSession)

require('./sockets')(httpServer, configSession)

app.use(csrf({}))

app.use((req, res, next) => {
  const token = req.csrfToken()
  res.cookie('XSRF-TOKEN', token);
  res.locals.csrfToken = token
  res.locals.errorMessages = null

  next()
})

const errorController = require('./controllers/errorController')
const indexRouter = require('./routers/index')

app.use('/', indexRouter)

// io.on('connection', (socket) => {
//   console.log('connected user')
//   socket.on('join room', (data) => {
//     const newUser = joinUser(socket.id, data.username, data.room)
//     socket.emit('send data', {
//       id : newUser.socketId, 
//       username : newUser.username,
//       roomname : newUser.roomname
//     })

//     socket.join(newUser.roomname)
//   })

//   socket.on('new message', (data) => {
//     io.to(data.roomname).emit('new message', {
//       socketId : data.socketId,
//       message : data.message
//     })
//   })
// })

app.use((req, res, next) => {
  return errorController.get404(res)
})  

app.use((error, req, res, next) => {
  if(error) {
    console.log(error)
    return errorController.get500(res)
  }
})



httpServer.listen(3000, (err, res) => {
  if(err) {
    console.log(err)
  } else {
    mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(res => {
        console.log('connected')
      })
      .catch(err => {
        console.log(err)
      })
  }
})