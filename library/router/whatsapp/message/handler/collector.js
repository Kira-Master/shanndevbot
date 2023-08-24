const { EventEmitter } = require('events')
const { MessageUpdateType } = require('@whiskeysockets/baileys')

class MessageCollector extends EventEmitter {
    /**
     * @type { WASocket }
     */
    client

    /**
     * @type { import('.').MessageCollectorOptions }
     */
    options

    /**
     * @type { import('@libs/utils/serialize').Serialize }
     */
    msg

    /**
     * @type { number }
     */
    countMessage = 0

    _timeout

    constructor(client, options, msg) {
        super()

        this.client = client
        this.options = options
        this.msg = msg

        this._timeout = setTimeout(() => this.stop('timeout'), this.options.time || 60000)

        this.messageHandler = this.messageHandler.bind(this)
        this.client.ev.on('messages.upsert', this.messageHandler)
    }

    async messageHandler({ messages, type }) {
        const message = messages[0]
        if (type !== 'notify') return
        if (message.key && message.key.remoteJid === 'status@broadcast') return
        if (!message.message) return

        const msg = await require('@libs/utils/serialize').serialize(message, this.client)

        if (this.msg.from !== msg.from) return
        if (typeof this.options.filter === 'string') {
            this.options.filter = new RegExp(this.options.filter)
        }
        if (this.options.filter.test(msg.body?.toLowerCase())) {
            this.emit('collect', msg)
            this.countMessage++
            if (this.countMessage >= this.options.max) {
                return this.stop('limit')
            }
        }
    }

    stop(reason) {
        clearTimeout(this._timeout)
        this._timeout = null
        this.client.ev.off('messages.upsert', this.messageHandler)
        this.emit('end', reason)
    }
}

module.exports = { MessageCollector }