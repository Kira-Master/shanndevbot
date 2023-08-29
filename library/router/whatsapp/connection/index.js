const Pino = require('pino')
const qrcode = require('qrcode')
const { Boom } = require('@hapi/boom')
const sendMessage = require('@server/whatsapp/message')
const { default: WASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } = require('@whiskeysockets/baileys')

const connectWhatsapp = async (sender, socket) => {
    let { version } = await fetchLatestBaileysVersion()
    let { state, saveCreds } = await useMultiFileAuthState('library/session/' + sender)
    let client = WASocket({ auth: state, logger: Pino({ level: 'silent' }), browser: ['Sender: ' + sender, 'Safari', '1.0'], version })

    client.ev.on('creds.update', saveCreds)
    client.ev.on('connection.update', ({ lastDisconnect, connection, qr }) => {
        if (qr) {
            qrcode.toDataURL(qr, (error, result) => {
                if (error || !result && socket) return socket.emit('message', 'Gagal mendapatkan qr, silahkan restart server')
                if (socket) return socket.emit('qr-code', { message: 'QR Code received, scan please!', result })
            })
        }

        if (connection) {
            if (connection === 'connecting') {
                if (socket) return socket.emit('message', 'Connecting...')
            } else if (connection === 'close') {
                let reason = new Boom(lastDisconnect.error).output.statusCode

                if (reason === DisconnectReason.restartRequired) {
                    connectWhatsapp(sender, socket)
                    if (socket) return socket.emit('message', 'Restart required, Restarting...')
                } else if (reason === DisconnectReason.connectionLost) {
                    connectWhatsapp(sender, socket)
                    if (socket) return socket.emit('message', 'Restart required, Restarting...')
                } else {
                    if (socket) return socket.emit('message', 'Server Disconnect, Hapus session dan scan ulang')
                }
            } else if (connection === 'open') {
                if (socket) return socket.emit('server-connected', 'Whatsapp is Ready to use')
            } else {
                if (socket) return socket.emit('message', 'Server Disconnect, Hapus session dan scan ulang')
            }
        }
    })

    client.ev.on('messages.upsert', ({ messages, type }) => {
        if (type !== 'notify') return
        sendMessage(client, { messages, type })
    })
}

module.exports = connectWhatsapp