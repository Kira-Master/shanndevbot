const { listCommands } = require('@router/builder/cmd')

module.exports = {
    callback: async ({ msg }) => {
        let text = `*ᴅᴏᴡɴʟᴏᴀᴅ*`
        for (var i of listCommands['Download']) {
            text += `\n⦿ ${prefix + i}`
        }

        return msg.reply(text)
    }
}