require("dotenv").config();
const express = require('express');
const axios = require('axios');
const massive = require('massive');
const socket = require('socket.io');
const aws = require('aws-sdk');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static("build"))
app.use(bodyParser.json());

const {
  SERVER_PORT,
  REACT_APP_DOMAIN,
  REACT_APP_CLIENT_ID,
  REACT_APP_LOGIN,
  CLIENT_SECRET,
  CONNECTION_STRING,
  SECRET,
  AUTH_PROTOCAL,
  S3_BUCKET,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY
} = process.env;

let guildList = []


massive(CONNECTION_STRING).then(db => {
  app.set('db', db)
  //find guilds from db where user_id is apart of guild_id
  db.find_guild()
    .then((guilds) => {
      guildList = guilds
      // console.log(guildList)
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
  // console.log('hit it')
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

  // console.log(userRes.data)
  let { email, picture, sub, name } = userRes.data;
  // check if that user already exists in our db
  const db = app.get('db');
  let foundCustomer = await db.find_account([sub]);
  // console.log('test')
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

app.get(`/api/account`, async (req, res) => {
  // const db = app.get('db')
  // let account = await db.find_account(req.session.user.account_id)
  let account = req.session.user
  // console.log(account)
  res.send(account)
})

app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.redirect(`${AUTH_PROTOCAL}${REACT_APP_LOGIN}`)
})

app.post('/api/findguild', async (req, res) => {
  const db = app.get('db')
  // console.log(req.body.message)
  let guilds = await db.find_guild_by_name(req.body.message)
  // console.log(guilds)
  res.send(guilds)
})

app.put('/api/image', async (req, res) => {
  const db = app.get('db')
  // console.log(req.session.user)
  await db.update_account_image(req.body.url, req.session.user.account_id)
  let foundCustomer = await db.find_account(req.session.user.account_auth_id)
  req.session.user = foundCustomer[0]
  res.send("hello")
})

app.put('/api/addguild', async (req, res) => {
  const db = app.get('db')
  // console.log(req.body)
  // console.log(req.session.user.account_id)
  await db.add_guild(req.session.user.account_id, req.body.id)
  res.send("Added to guild")
})

app.put('/api/create', async (req, res) => {
  const db = app.get('db')
  // console.log(req.body)
  let newGuild = await db.create_guild(req.body.name, req.body.img)
  guildList.push(newGuild[0])
  // console.log(newGuild[0].guild_id)
  // console.log(req.body.account.account_id)
  await db.add_guild(req.body.account.account_id, newGuild[0].guild_id)
  res.send("Created new Guild")
})

app.get('/api/sign-s3', (req, res) => {

  aws.config = {
    region: 'us-west-1',
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }

  const s3 = new aws.S3();
  const fileName = req.query['file-name'];
  const fileType = req.query['file-type'];
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 60,
    ContentType: fileType,
    ACL: 'public-read'
  };

  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      console.log(err);
      return res.end();
    }
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };

    return res.send(returnData)
  });
});

var server = app.listen(SERVER_PORT, () => console.log(`Listening on port ${SERVER_PORT}`))
var io = socket(server)

io.use(sharedssession(session, {
  autoSave: true
}))

io.on('connection', function (socket) {
  console.log('made socket connection', socket.id)
  socket.on("newMessage", (data) => {
    // console.log(data)

    // console.log(socket.handshake.session)
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
    socket.join(room.guild_name)
    console.log(`joining room ${room.guild_name}`)
  })

  socket.on("deleteMessage", (data) => {
    let { account_id } = socket.handshake.session.user
    let { message_id, guild_id } = data
    // console.log(data)
    app.get('db').delete_message(message_id, account_id)
    let roomName = guildList.find(g => g.guild_id === guild_id).guild_name
    // console.log(roomName)
    io.to(roomName).emit("refreshMessages", { Hi: "Hello" })
    socket.emit('generalMessage', 'hi')
  })


})
