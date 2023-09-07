const { listCommands } = require('@router/builder/cmd')

module.exports = {
    callback: async ({ msg, prefix, command }) => {
        let text = `*ᴘʀɪᴍʙᴏɴ*`
        for (var i of listCommands['Primbon']) {
            text += `\n⦿ ${prefix + i}`
        }

        return msg.reply(text)
    }
}