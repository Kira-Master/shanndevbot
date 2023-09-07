const { listCommands } = require('@router/builder/cmd')

module.exports = {
    callback: async ({ msg, prefix, command }) => {
        let text = `*ɢᴀᴍᴇᴍᴇɴᴜ*`
        for (var i of listCommands['Game']) {
            text += `\n⦿ ${prefix + i}`
        }

        return msg.reply(text)
    }
}