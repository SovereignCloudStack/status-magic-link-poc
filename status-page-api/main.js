import express from 'express'
import http from 'http'
import crypto from 'crypto'
import axios from 'axios'

import config from './config.js'
import roles from './roles.js' // Or read a yaml/json file
import rolePermissions from './permissions.js' // Or read a yaml/json file

import dummyComponents from './components.js' // from the "database"

var app = express()
var httpServer = http.createServer(app)

var userSessions = {}

// This is a dummy session for development so you can always use export ACCESS_TOKEN="test" to login
userSessions['test'] = {
  mail: 'bob@cloudandheat.com',
  loginTime: new Date()
}

app.use(express.json())

// Call this to check if the service is running
app.get('/', function (req, res) {
  res.send('ok')
})

// Call this to get a new token (via mail)
app.post('/token', async function (req, res) {
  // TODO: validate the request

  // Generate a new token and write it to the "database"
  var token = crypto.randomBytes(36).toString('hex')
  userSessions[token] = {
    mail: req.body.mail,
    loginTime: new Date()
  }

  /*
    Send this token to every configured webhook. So the
    receivers of this webhook can decide how to proceed
    with this token (e.g. send it via mail)
  */
  try {
    await axios.post(`${config.authWebhooks[0]}/token`, { // Todo: Nice logic to support multiple webhooks
      mail: req.body.mail,
      token: token
    })
    res.send(`Please check your mail: ${req.body.mail}`)
  } catch (error) {
    console.log(error)
    res.send('Uhhhh... something went wrong')
  }
})

/*
  Before all other requests (not: "/" or "/token") we check if
  a token was provided in the request and if this is the
  case, we determine some user information and add it to
  the request. This pattern is known as middleware.
*/
app.use(function (req, res, next) {
  // Default information for an anonymous user
  var userInfo = {
    mail: null,
    roles: ['everyone'],
    permissions: {},
    tokenInfo: 'no token provided'
  }

  // Check if the Authorization-Header is set
  if ('authorization' in req.headers) {

    // Check (the database) if we have a session for this user
    if (req.headers.authorization in userSessions) {
      var userSession = userSessions[req.headers.authorization]

      // Check if the session already expired
      var now = new Date()
      userInfo.loginTime = userSession.loginTime
      userInfo.remainingTime = userInfo.loginTime.valueOf() + 1000 * 60 * 60 * 24 - now.valueOf()
      if (userInfo.remainingTime < 0) {
        userInfo.tokenInfo = 'token expired'
      } else {
        userInfo.tokenInfo = 'token valid'
        userInfo.mail = userSession.mail
        userInfo.domain = userInfo.mail.substring(userSession.mail.lastIndexOf('@'))

        // Gather from the roles.js all roles the user is part of
        Object.keys(roles).forEach(roleName => {
          var roleUsers = roles[roleName]
          if (roleUsers.includes(userInfo.mail) || roleUsers.includes(userInfo.domain)) {
            userInfo.roles.push(roleName)
          }
        })
      }
    } else {
      userInfo.tokenInfo = 'no user for token'
    }
  }

  // Gather from the permissions.js all permissions the user owns
  userInfo.roles.forEach(function (roleName) {
    var permissions = rolePermissions[roleName]

    Object.keys(permissions).forEach(function (permissionName) {
      if(!(permissionName in userInfo.permissions)) {
        userInfo.permissions[permissionName] = []
      }
      var targets = permissions[permissionName]
      userInfo.permissions[permissionName] = userInfo.permissions[permissionName].concat(targets)
    })
  })

  // Add the gathered information to the request
  req.userInfo = userInfo
  next()
})

/*
  Call this to provide the user with information about his
  current state. It is particularly nice to "see" your own
  permissions. For example, frontends are able to hide
  buttons where the user is not allowed to click them anyway.
*/
app.get('/myself/', function (req, res) {
  res.send(req.userInfo)
})

// Call this to get a list of all components and their status
app.get('/components/status/', function (req, res) {
  if (!('viewComponentStatus' in req.userInfo.permissions)) {
    throw Error('you are not allowed to see any status')
  }

  /*
    Filter all components the user is allowed to see from
    "the database" based on his current permissions.
  */
  var filteredComponents = dummyComponents.filter(
    c =>
      req.userInfo.permissions.viewComponentStatus.includes(`${c.group}/${c.name}`) ||
      req.userInfo.permissions.viewComponentStatus.includes(`${c.group}/*`) ||
      req.userInfo.permissions.viewComponentStatus.includes('*/*')
  )
  res.send(filteredComponents)
})

// Run the service
httpServer.listen(
  config.port,
  config.host, function () {
  console.log(
    'listening on ' +
    config.host +
    ':' +
    config.port
  )
})
