const { listCommands } = require('@router/builder/cmd')

module.exports = {
    callback: async ({ msg }) => {
        let text = `*ʀᴀɴᴅᴏᴍɪᴍᴀɢᴇ*`
        for (var i of listCommands['Random Image']) {
            text += `\n⦿ ${prefix + i}`
        }

        return msg.reply(text)
    }
}