const { listCommands } = require('@router/builder/cmd')

module.exports = {
    callback: async ({ msg }) => {
        let text = `*ꜱᴇᴀʀᴄʜᴍᴇɴᴜ*`
        for (var i of listCommands['Search']) {
            text += `\n⦿ ${prefix + i}`
        }

        return msg.reply(text)
    }
}