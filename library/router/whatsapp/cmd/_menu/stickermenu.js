const { listCommands } = require('@router/builder/cmd')

module.exports = {
    callback: async ({ msg }) => {
        let text = `*ꜱᴛɪᴄᴋᴇʀᴍᴇɴᴜ*`
        for (var i of listCommands['Sticker']) {
            text += `\n⦿ ${prefix + i}`
        }

        return msg.reply(text)
    }
}