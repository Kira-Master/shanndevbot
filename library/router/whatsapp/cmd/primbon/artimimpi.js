const { lolhuman } = require('@router/myfunc')

module.exports = {
    wait: true,
    category: 'Primbon',
    example: '.artimimpi mobil',
    callback: async ({ msg, fullArgs }) => {
        let data = await lolhuman('primbon/artimimpi?query=' + fullArgs)
        if (!data || data.status && data.status === 500 || !data.length) return msg.reply('TIdak ditemukan')

        let text = '*[ Arti Mimpi ]*\n\n'
        for (let a of data) {
            text += a + '\n\n'
        }

        return msg.reply(text)
    }
}