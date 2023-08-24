const { getContentType } = require('@whiskeysockets/baileys')
const sendMessage = require('@server/whatsapp/message/handler/command')
const serialize = require('@server/whatsapp/message/handler/serialize')

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
    const fullArgs = msg.body?.replace(command, '')?.slice(1)?.trim() || null

    return await sendMessage({ client, msg, prefix, args, command, fullArgs })
}