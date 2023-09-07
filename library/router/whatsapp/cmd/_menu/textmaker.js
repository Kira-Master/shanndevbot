const { listCommands } = require('@router/builder/cmd')

module.exports = {
    callback: async ({ msg, prefix, command }) => {
        let text = `*ᴛᴇxᴛᴍᴀᴋᴇʀ*`
        for (var i of listCommands['Text Maker']) {
            text += `\n⦿ ${prefix + i}`
        }

        return msg.reply(text)
    }
}