const axios = require('axios')
const cheerio = require('cheerio')

module.exports = {
    wait: true,
    categor: 'Search',
    example: 'Contoh penggunaan : .wikipedia tahu',
    callback: async ({ msg, fullArgs }) => {
        await axios.get('https://id.wikipedia.org/wiki/' + fullArgs)
            .then(({ data }) => {
                let $ = cheerio.load(data)
                let artikel = $('div.mw-parser-output > p').text()
                let fileurl = 'https:' + ($('.infobox-image > span > a > img').attr('src') || $('.mw-file-description > img').attr('src'))

                if (!fileurl || !artikel) return msg.reply(process.env.MESSAGE_ERROR)
                return msg.replyImage({ url: fileurl }, artikel.replace(/\n/g, '\n\n'))
            })
            .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
    }
}