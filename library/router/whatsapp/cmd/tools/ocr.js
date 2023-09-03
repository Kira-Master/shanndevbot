const fs = require('fs')
const { telegraph, lolhuman } = require('@server/whatsapp/message/handler/myfunc')

module.exports = {
    wait: true,
    category: 'Tools',
    callback: async ({ msg, prefix, command }) => {
        if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
            let path = `ocr-${Date.now()}.jpg`
            let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
            await fs.writeFileSync(path, file)

            let fileurl = await telegraph(path)
            let filedata = await lolhuman('ocr?img=' + fileurl)
            await fs.unlinkSync(path)

            if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)
            return msg.reply(filedata)
        } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command}', prefix + command))
    }
}