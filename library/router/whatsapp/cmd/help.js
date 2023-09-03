const { timeFormat } = require('@router/myfunc')
const { listCommands, commands } = require('@router/builder/cmd')

module.exports = {
    aliases: ['menu', 'download', 'gamemenu', 'randomtext', 'searchmenu', 'stickermenu', 'textmaker', 'toolsmenu'],
    callback: async ({ msg, client, command, prefix }) => {
        if (command === 'download') {
            let text = `*ᴅᴏᴡɴʟᴏᴀᴅ*`
            for (var i of listCommands['Download']) {
                text += `\n⦿ ${prefix + i}`
            }

            return msg.reply(text)
        } else if (command === 'gamemenu') {
            let text = `*ɢᴀᴍᴇᴍᴇɴᴜ*`
            for (var i of listCommands['Game']) {
                text += `\n⦿ ${prefix + i}`
            }

            return msg.reply(text)
        } else if (command === 'randomtext') {
            let text = `*ʀᴀɴᴅᴏᴍᴛᴇxᴛ*`
            for (var i of listCommands['Random Text']) {
                text += `\n⦿ ${prefix + i}`
            }

            return msg.reply(text)
        } else if (command === 'searchmenu') {
            let text = `*ꜱᴇᴀʀᴄʜᴍᴇɴᴜ*`
            for (var i of listCommands['Search']) {
                text += `\n⦿ ${prefix + i}`
            }

            return msg.reply(text)
        } else if (command === 'stickermenu') {
            let text = `*ꜱᴛɪᴄᴋᴇʀᴍᴇɴᴜ*`
            for (var i of listCommands['Sticker']) {
                text += `\n⦿ ${prefix + i}`
            }

            return msg.reply(text)
        } else if (command === 'textmaker') {
            let text = `*ᴛᴇxᴛᴍᴀᴋᴇʀ*`
            for (var i of listCommands['Text Maker']) {
                text += `\n⦿ ${prefix + i}`
            }

            return msg.reply(text)
        } else if (command === 'toolsmenu') {
            let text = `*ᴛᴏᴏʟꜱᴍᴇɴᴜ*`
            for (var i of listCommands['Tools']) {
                text += `\n⦿ ${prefix + i}`
            }

            return msg.reply(text)
        } else {
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
}