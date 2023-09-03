const axios = require('axios')
const cheerio = require('cheerio')

module.exports = {
    wait: true,
    category: 'Download',
    aliases: ['fb', 'fbdl'],
    example: process.env.MESSAGE_NOURL,
    callback: async ({ msg, fullArgs }) => {
        if (!/https:|http:/.test(fullArgs) || !/facebook.com|fb.watch/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
        let { data } = await axios.post('https://getmyfb.com/process', { id: fullArgs, locale: 'en' })
        if (!data) return msg.reply(process.env.MESSAGE_ERROR + ' 1')

        let $ = cheerio.load(data)
        let fileurl = $('ul.results-list > li:first-child > a').attr('href')

        let errorMsg = $('.result-error > h4').text()
        if (!fileurl) return msg.reply((errorMsg || process.env.MESSAGE_ERROR))

        // return msg.replyVideo({ url: fileurl })

        await axios.post('https://getmyfb.com/process', { id: fullArgs, locale: 'en' })
            .then(({ data }) => {
                if (!data) return msg.reply(process.env.MESSAGE_ERROR)

                let $ = cheerio.load(data)
                let errorMsg = $('.result-error > h4').text()
                let fileurl = $('ul.results-list > li:first-child > a').attr('href')

                if (errorMsg || fileurl) return msg.reply((process.env.MESSAGE_ERROR || errorMsg))
                return msg.replyVideo({ url: fileurl }, '_*Success, data berhasil didapatkan*_')
            })
            .catch(() => msg.reply(process.env.MESSAGE_ERROR))
    }
}