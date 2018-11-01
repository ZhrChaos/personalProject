require("dotenv").config();
const express = require('express');
const axios = require('axios');
const massive = require('massive');
const socket = require('socket.io');

const app = express();
app.use(express.static("build"))

const {
  SERVER_PORT,
  REACT_APP_DOMAIN,
  REACT_APP_CLIENT_ID,
  CLIENT_SECRET,
  CONNECTION_STRING,
  SECRET,
  AUTH_PROTOCAL
} = process.env;

let guildList = []


massive(CONNECTION_STRING).then(db => {
  app.set('db', db)
  //find guilds from db where user_id is apart of guild_id
  db.find_guild()
    .then((guilds) => {
      guildList = guilds
      console.log(guildList)
    })
})

var session = require("express-session")({
  secret: SECRET,
  resave: false,
  saveUninitialized: false
})

var sharedssession = require('express-socket.io-session');


app.use(session)


app.get('/auth/callback', async (req, res) => {
  console.log('hit it')
  let payload = {
    client_id: REACT_APP_CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code: req.query.code,
    grant_type: 'authorization_code',
    redirect_uri: `${AUTH_PROTOCAL}://${req.headers.host}/auth/callback`
  }

  // auth0 sending code in req.query.code
  let tokenRes = await axios.post(`https://${REACT_APP_DOMAIN}/oauth/token`, payload)
  // exchange code for token. token is on resWithToken.data.access_token
  // exchange token for user data
  let userRes = await axios.get(`https://${REACT_APP_DOMAIN}/userinfo?access_token=${tokenRes.data.access_token}`)

  console.log(userRes.data)
  let { email, picture, sub, name } = userRes.data;
  // check if that user already exists in our db
  const db = app.get('db');
  let foundCustomer = await db.find_account([sub]);
  console.log('test')
  if (foundCustomer[0]) {
    // found user existing in the db, put user on session
    req.session.user = foundCustomer[0];
  } else {
    // no user found by google id. create user in db
    let createdCust = await db.create_account([name, picture, email, sub])
    req.session.user = createdCust[0]
  }
  res.redirect('/#/')
})


app.get(`/api/messages`, async (req, res) => {
  const db = app.get('db')
  let loadMessage = await db.find_message()
  res.send(loadMessage)
})

app.get(`/api/guilds`, async (req, res) => {
  const db = app.get('db')
  let userGuilds = await db.find_guild_for_user(req.session.user.account_id)
  res.send(userGuilds)
})


var server = app.listen(SERVER_PORT, () => console.log(`Listening on port ${SERVER_PORT}`))
var io = socket(server)

io.use(sharedssession(session, {
  autoSave: true
}))

io.on('connection', function (socket) {
  console.log('made socket connection', socket.id)
  socket.on("newMessage", (data) => {
    console.log(data)

    console.log(socket.handshake.session)
    let { account_name, account_id, account_img } = socket.handshake.session.user
    app.get('db').create_message([data.message, socket.handshake.session.user.account_id, data.roomId])
    let generalMessage = {
      account_id: account_id,
      account_name: account_name,
      account_img: account_img,
      message_content: data.message,
      guild_id: data.roomId
    }
    // console.log(generalMessage)
    let roomName = guildList.find(g => g.guild_id === data.roomId).guild_name
    io.to(roomName).emit("generalMessage", generalMessage)
  })

  socket.on("join-room", (data) => {
    let room = guildList.find(obj => obj.guild_id === data.roomName)
    // console.log(room.guild_id)
    socket.join(room.guild_id)
    console.log(`joining room ${room.guild_name}`)
  })


})
