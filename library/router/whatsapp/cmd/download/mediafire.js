const axios = require('axios')
const cheerio = require('cheerio')

module.exports = {
    wait: true,
    category: 'Download',
    example: process.env.MESSAGE_NOURL,
    callback: async ({ msg, fullArgs }) => {
        if (!/https:|http:/.test(fullArgs) || !/mediafire.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
        await axios.get(fullArgs)
            .then(async ({ data }) => {
                let $ = cheerio.load(data)
                let filename = $('div.filename').text()
                let fileurl = $('#downloadButton').attr('href')

                await axios.get(fileurl).then(({ headers }) => { return msg.replyDocument({ url: fileurl }, headers['content-type'], filename) }).catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
            })
            .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
    }
}