import express from 'express'
import http from 'http'
import nodemailer from 'nodemailer'
import config from './config.js'

// Setup the mail client
var transporter = nodemailer.createTransport(config.smtp)
var app = express()
var httpServer = http.createServer(app)

app.use(express.json())

// Call this to send the token via mail
app.post('/token', function (req, res) {
  var mail = req.body.mail
  var token = req.body.token

  var mailOptions = {
    from: config.mail.sender,
    to: mail,
    subject: 'Your Token',
    html: `Your Token: \n export ACCESS_TOKEN="${token}"`
  }

  transporter.sendMail(mailOptions, function (error) {
    if (error) {
      console.log(error)
      res.status(500).send({status: 'fail', success: false})
    } else {
      res.send({status: 'ok', success: true})
    }
  })
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
