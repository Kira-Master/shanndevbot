const { listCommands } = require('@router/builder/cmd')

module.exports = {
    callback: async ({ msg, prefix, command }) => {
        let text = `*ᴀɴɪᴍᴇ*`
        for (var i of listCommands['Anime']) {
            text += `\n⦿ ${prefix + i}`
        }

        return msg.reply(text)
    }
}