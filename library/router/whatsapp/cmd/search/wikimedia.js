const axios = require('axios')
const cheerio = require('cheerio')

module.exports = {
    wait: true,
    category: 'Search',
    example: 'Contoh penggunaan : .wikimedia Ichigo kurosaki',
    callback: async ({ msg, fullArgs }) => {
        await axios.get('https://commons.wikimedia.org/w/index.php?search=' + fullArgs + '&title=Special:MediaSearch&go=Go&type=image')
            .then(({ data }) => {
                let fileurl = []
                let $ = cheerio.load(data)

                $('.sdms-search-results__list-wrapper > div > a').each(function (a, b) {
                    let url = $(b).find('img').attr('data-src') || $(b).find('img').attr('src')
                    fileurl.push(url)
                })

                if (!fileurl || !fileurl.length) return msg.reply(process.env.MESSAGE_ERROR)
                return msg.replyImage({ url: fileurl[Math.floor(Math.random() * fileurl.length)] })
            })
            .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
    }
}