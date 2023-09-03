const { writeExif } = require('@router/exif')

module.exports = {
    aliases: ['stiker', 's'],
    category: 'Sticker',
    callback: async ({ msg, args }) => {
        let fullArgs = args.join(' ')
        let [packname, author] = fullArgs ? fullArgs.split('|') : 'Bot|Whatsapp'.split('|')

        if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
            let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
            let fileurl = await writeExif({ mimetype: 'image', data: file }, { packname, author })

            await msg.replySticker({ url: fileurl })
        } else if (msg.typeCheck.isVideo || msg.typeCheck.isQuotedVideo) {
            let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
            let fileurl = await writeExif({ mimetype: 'video', data: file }, { packname, author })

            await msg.replySticker({ url: fileurl })
        } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command}', prefix + command))
    }
}