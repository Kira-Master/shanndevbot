const fs = require('fs')
const { lolhuman } = require('@router/myfunc')

module.exports = {
    wait: true,
    category: 'Anime',
    callback: async ({ msg, prefix, command }) => {
        if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
            let path = 'upload/' + Date.now() + '.jpg'
            let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))

            await fs.writeFileSync('library/' + path, file)
            let data = await lolhuman('wait?img=' + process.env.BASE_URL + path)

            if (!data || (data.status && data.status === 500)) return msg.reply('Tidak ditemukan')
            let caption = `*[ ${data.title_romaji} ]*\n\nAkurasi: ${data.similarity}\nScene: ${data.at}\nEpisode: ${data.episode}`

            return msg.replyVideo({ url: data.video }, caption)
        } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command}', prefix + command))
    }
}