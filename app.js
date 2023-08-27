require('dotenv').config()
require('module-alias/register')

const http = require('http')
const path = require('path')
const main = require('@server')
const rimraf = require('rimraf')
const express = require('express')
const { GlobSync } = require('glob')
const favicon = require('serve-favicon')
const bodyParser = require('body-parser')
const whatsappConnection = require('@server/whatsapp/connection')

const application = express()
const server = http.createServer(application)
const socketIO = require('socket.io')(server)

application.set("json spaces", 2)
application.set('view engine', 'ejs')
application.set('views', __dirname + '/library/router/view')

application.use('/', main)
application.use(bodyParser.json())
application.use(express.static('library'))
application.use(bodyParser.urlencoded({ extended: true }))
application.use(favicon(path.join(__dirname, "library", "assets", "favicon.jpeg")))

socketIO.on('connection', socket => {
    socket.on('whatsapp-connection', sender => {
        whatsappConnection(sender, socket)
    })

    socket.on('delete-session', sender => {
        let sessionfiles = new GlobSync(`library/session/${sender}`).found
        if (!sessionfiles.length) return socket.emit('session-deleted', { status: false, message: 'Perangkat belum terkoneksi' })

        sessionfiles.forEach((v) => rimraf.sync(v))
        return socket.emit('session-deleted', { status: true, message: 'Berhasil menghapus session' })
    })
})

process.on('uncaughtException', (error) => { console.log(`[ ! ] ${error.message}`) })
server.listen(2866, () => { console.log(`running on 2866`) })