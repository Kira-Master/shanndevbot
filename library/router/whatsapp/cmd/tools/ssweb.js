const fs = require('fs')
const axios = require('axios')

module.exports = {
    wait: true,
    category: 'Tools',
    example: 'Contoh penggunaan : .ssweb https://www.facebook.com/',
    callback: async ({ msg, fullArgs }) => {
        if (!/https:|http:/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)

        await axios.post('https://webscreenshot.vercel.app/api', { format: 'jpeg', full: false, isTweet: false, scale: 1, width: 1200, height: 628, url: fullArgs })
            .then(async ({ data }) => {
                if (!data || !data.image) return msg.reply(process.env.MESSAGE_ERROR)

                let fileurl = Date.now() + '.jpeg'
                let filebuffer = Buffer.from(data.image.replace('data:image/jpeg;base64,', ''), 'base64')

                await fs.writeFileSync(fileurl, filebuffer)
                return msg.replyImage({ url: fileurl }).then(() => { fs.unlinkSync(fileurl) }).catch(() => { fs.unlinkSync(fileurl) })
            })
            .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
    }
}