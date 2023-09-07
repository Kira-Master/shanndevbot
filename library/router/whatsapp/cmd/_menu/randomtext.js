const { listCommands } = require('@router/builder/cmd')

module.exports = {
    callback: async ({ msg }) => {
        let text = `*ʀᴀɴᴅᴏᴍᴛᴇxᴛ*`
        for (var i of listCommands['Random Text']) {
            text += `\n⦿ ${prefix + i}`
        }

        return msg.reply(text)
    }
}