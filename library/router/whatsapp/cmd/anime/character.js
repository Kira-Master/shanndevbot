const { lolhuman } = require('@router/myfunc')

module.exports = {
    wait: true,
    category: 'Anime',
    example: process.env.MESSAGE_NOQUERY,
    callback: async ({ msg, fullArgs }) => {
        let data = await lolhuman('character?query=' + fullArgs)
        if (!data || data.status && data.status === 500) return msg.reply('Tidak ditemukan')

        let image = await msg.replyImage({ url: data.image.large })
        return msg.reply(data.description.replace(/__/g, '_').replace(/~/g, '').replace(/!/g, ''), image)
    }
}