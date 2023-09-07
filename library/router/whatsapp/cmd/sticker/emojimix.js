const axios = require('axios')
const { writeExifImg } = require('@router/exif')

module.exports = {
    wait: true,
    category: 'Sticker',
    example: 'Contoh penggunaan: .emojimix 😅+🙃',
    callback: async ({ msg, fullArgs }) => {
        let [a, b] = fullArgs.split('+')
        if (!a || !b) return msg.reply('Contoh penggunaan: .emojimix 😅+🙃')

        await axios(`https://api.lolhuman.xyz/api/emojimix/${a}+${b}?apikey=${process.env.APIKEY}`, { responseType: 'arraybuffer' })
            .then(async ({ data }) => {
                if (!data) return msg.reply(process.env.MESSAGE_ERROR)
                let fileurl = await writeExifImg(data, { packname: a, author: b })

                return msg.replySticker({ url: fileurl })
            })
            .catch(() => msg.reply(process.env.MESSAGE_ERROR))
    }
}