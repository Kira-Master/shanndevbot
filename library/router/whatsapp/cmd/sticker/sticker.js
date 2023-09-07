const axios = require('axios')
const { writeExif } = require('@router/exif')

module.exports = {
    wait: true,
    aliases: ['stiker', 's'],
    category: 'Sticker',
    callback: async ({ msg, fullArgs, command, prefix }) => {
        if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
            let [packname, author] = fullArgs ? fullArgs.split('|') : 'Bot|Whatsapp'.split('|')
            let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
            let fileurl = await writeExif({ mimetype: 'image', data: file }, { packname, author })

            await msg.replySticker({ url: fileurl })
        } else if (msg.typeCheck.isVideo || msg.typeCheck.isQuotedVideo) {
            let [packname, author] = fullArgs ? fullArgs.split('|') : 'Bot|Whatsapp'.split('|')
            let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
            let fileurl = await writeExif({ mimetype: 'video', data: file }, { packname, author })

            await msg.replySticker({ url: fileurl })
        } else {
            if (/http:|https:/.test(fullArgs)) {
                await axios.get(fullArgs, { responseType: 'arraybuffer' })
                    .then(async ({ headers, data }) => {
                        if (!headers || !data || !/image/.test(headers['content-type'])) return msg.reply('Kirim gambar/video dengan caption ' + prefix + command + ' atau url gambar')
                        let fileurl = await writeExif({ data, mimetype: headers['content-type'] }, { packname: 'Bot', author: 'Whatsapp' })

                        return msg.replySticker({ url: fileurl })
                    })
                    .catch(() => msg.reply('Kirim gambar/video dengan caption ' + prefix + command + ' atau url gambar'))
            } else return msg.reply('Kirim gambar/video dengan caption ' + prefix + command + ' atau url gambar')
        }
    }
}