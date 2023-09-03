const { ICommand } = require('@router/builder')
const { commands } = require('@router/builder/cmd')
const { getContentType } = require('@whiskeysockets/baileys')
const serialize = require('@server/whatsapp/message/handler/serialize')

const _collection = new Map()

module.exports = async (client, { messages, type }) => {
    const message = messages[0]
    if ((message.key && message.key.remoteJid === 'status@broadcast') || !message.message) return

    message.type = getContentType(message.message)
    let body = message.message?.conversation || message.message[message.type]?.text || message.message[message.type]?.caption || message.message?.listResponseMessage?.singleSelectReply?.selectedRowId || message.message?.buttonsResponseMessage?.selectedButtonId || message.message?.templateButtonReplyMessage?.selectedId || null
    let isCommand = /^[°•π÷×¶∆£¢€¥®™✓_=|~!?#$%^@*&.+-,©^\/]/.test(body)

    client.readMessages([message.key])
    if (message.type === 'protocolMessage' || message.type === 'senderKeyDistributionMessage' || !message.type) return

    const msg = await serialize(message, client)
    if (msg.responseId) msg.body = msg.responseId
    if (!isCommand) return

    const prefix = isCommand ? msg.body[0] : null
    const args = msg.body?.trim()?.split(/ +/)?.slice(1)
    const command = isCommand ? msg.body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : msg.body
    const fullArgs = args.join(' ')

    const getCommand = commands.get(command) || commands.find((v) => v?.aliases && v?.aliases?.includes(command))
    if (getCommand) {
        if (getCommand.wait) await msg.reply(process.env.MESSAGE_LOAD)
        if (getCommand.example && !fullArgs) return msg.reply(getCommand.example)
        if (getCommand.group && !msg.isGroup) return msg.reply(process.env.MESSAGE_GROUP)
        if (getCommand.private && msg.isGroup) return msg.reply(process.env.MESSAGE_PRIVATE)
        if (getCommand.group && getCommand.admin && !msg.groupMetadata.participants.filter((v) => v.admin).map((v) => v.id).includes(msg.sender)) return msg.reply(process.env.MESSAGE_ADMIN)

        return getCommand.callback({ client, message, msg, command, prefix, args, fullArgs })
    }
}