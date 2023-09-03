const fs = require('fs')
const { telegraph } = require('@server/whatsapp/message/handler/myfunc')

module.exports = {
    wait: true,
    category: 'Tools',
    callback: async ({ msg, prefix, command }) => {
        if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
            let path = `jadianime-${Date.now()}.jpg`
            let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
            await fs.writeFileSync(path, file)

            let fileurl = await telegraph(path)
            await fs.unlinkSync(path)

            return msg.replyImage({ url: `https://api.lolhuman.xyz/api/imagetoanime?img=${fileurl}&apikey=${process.env.APIKEY}` }).catch(() => msg.reply(process.env.MESSAGE_ERROR))

        } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command}', prefix + command))
    }
}