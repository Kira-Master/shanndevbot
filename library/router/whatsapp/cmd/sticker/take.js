const { writeExif } = require('@router/exif')

module.exports = {
    category: 'Sticker',
    callback: async ({ msg, fullArgs }) => {
        let [packname, author] = fullArgs ? fullArgs.split('|') : 'Bot|Whatsapp'.split('|')

        if (msg.typeCheck.isQuotedSticker) {
            let file = await msg.quoted.download('buffer')
            let fileurl = await writeExif({ mimetype: 'webp', data: file }, { packname, author })

            await msg.replySticker({ url: fileurl })
        } else return msg.reply(process.env.MESSAGE_NOSTICKER.replace('{prefix + command}', prefix + command))
    }
}