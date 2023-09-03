const fs = require('fs')
const axios = require('axios')

module.exports = {
    wait: true,
    category: 'Tools',
    callback: async ({ msg, prefix, command }) => {
        if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
            let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))

            await axios.post('https://backend.zyro.com/v1/ai/remove-background', { image: 'data:image/jpeg;base64,' + file.toString('base64') })
                .then(async ({ data }) => {
                    if (!data || !data.result) return msg.reply(process.env.MESSAGE_ERROR)

                    let fileurl = Date.now() + '.png'
                    let filebuffer = Buffer.from(data.result.replace('data:image/PNG;base64,', ''), 'base64')

                    await fs.writeFileSync(fileurl, filebuffer)
                    return msg.replyImage({ url: fileurl }).then(() => { fs.unlinkSync(fileurl) }).catch(() => { fs.unlinkSync(fileurl) })
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
        } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command}', prefix + command))
    }
}