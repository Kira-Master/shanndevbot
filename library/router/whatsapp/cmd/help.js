const { timeFormat } = require('@router/myfunc')
const { listCommands, commands } = require('@router/builder/cmd')

module.exports = {
    aliases: ['menu'],
    callback: async ({ msg, client, command, prefix }) => {

        let caption = `ʜᴀʟᴏ ᴋᴀᴋ @${msg.senderNumber}👋. ꜱᴀʏᴀ ᴀᴅᴀʟᴀʜ ʙᴏᴛ ᴡʜᴀᴛꜱᴀᴘᴘ ᴏᴛᴏᴍᴀᴛɪꜱ ʏᴀɴɢ ᴅᴀᴘᴀᴛ ᴍᴇᴍʙᴀɴᴛᴜ ᴍᴇʟᴀᴋᴜᴋᴀɴ ꜱᴇꜱᴜᴀᴛᴜ, ᴍᴇɴᴄᴀʀɪ ᴅᴀɴ ᴍᴇɴᴅᴀᴘᴀᴛᴋᴀɴ ᴅᴀᴛᴀ ᴀᴛᴀᴜ ɪɴꜰᴏʀᴍᴀꜱɪ ᴍᴇʟᴀʟᴜɪ ᴡʜᴀᴛꜱᴀᴘᴘ.`

        caption += '\n\nʙᴏᴛ ɪɴꜰᴏ'
        caption += `\n⦿ *ꜰɪᴛᴜʀ:* ${commands.size} Active`
        caption += `\n⦿ *ᴏᴡɴᴇʀ:* wa.me/${client.user.id.split(':')[0]}`
        caption += `\n⦿ *ᴜᴘᴛɪᴍᴇ:* ${(timeFormat(process.uptime()) || 'Beberapa detik yang lalu')}`

        caption += `\n\nʙᴏᴛ ᴍᴇɴᴜ`
        caption += `\n⦿ ${prefix}ᴅᴏᴡɴʟᴏᴀᴅ`
        caption += `\n⦿ ${prefix}ɢᴀᴍᴇᴍᴇɴᴜ`
        caption += `\n⦿ ${prefix}ʀᴀɴᴅᴏᴍᴛᴇxᴛ`
        caption += `\n⦿ ${prefix}ʀᴀɴᴅᴏᴍɪᴍᴀɢᴇ`
        caption += `\n⦿ ${prefix}ꜱᴇᴀʀᴄʜᴍᴇɴᴜ`
        caption += `\n⦿ ${prefix}ꜱᴛɪᴄᴋᴇʀᴍᴇɴᴜ`
        caption += `\n⦿ ${prefix}ᴛᴇxᴛᴍᴀᴋᴇʀ`
        caption += `\n⦿ ${prefix}ᴛᴏᴏʟꜱᴍᴇɴᴜ`

        return client.sendMessage(msg.from, { image: { url: 'library/assets/preview.jpg' }, caption, mentions: [msg.sender] })
    }
}