const fs = require('fs')
const axios = require('axios')
const { writeExifImg } = require('@router/exif')

module.exports = {
    wait: true,
    category: 'Sticker',
    callback: async ({ msg, fullArgs, prefix, command }) => {
        if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
            let path = 'upload/' + Date.now() + '.jpg'
            let [a, b] = (fullArgs) ? fullArgs.split('|') : ['a', 'b']
            let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))

            await fs.writeFileSync('library/' + path, file)
            await axios.get('https://api.lolhuman.xyz/api/memecreator?apikey=' + process.env.APIKEY + '&text1=' + a + '&text2=' + b + '&img=' + process.env.BASE_URL + path, { responseType: 'arraybuffer' })
                .then(async ({ data }) => {
                    await fs.unlinkSync('library/' + path)
                    let fileurl = await writeExifImg(data, { packname: a, author: b })

                    return msg.replySticker({ url: fileurl })
                })
                .catch(async () => {
                    await fs.unlinkSync('library/' + path)
                    return msg.reply(process.env.MESSAGE_ERROR)
                })
        } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command}', prefix + command))
    }
}