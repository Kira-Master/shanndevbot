const axios = require('axios')
const cheerio = require('cheerio')

module.exports = {
    wait: true,
    category: 'Download',
    example: process.env.MESSAGE_NOURL,
    callback: async ({ msg, fullArgs }) => {
        if (!/https:|https:/.test(fullArgs) || !/soundcloud.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)

        let token = await axios.get('https://soundcloudmp3.org/id')
        let $ = cheerio.load(token.data)

        let tokenvalue = $('form#conversionForm > input[type=hidden]').attr('value')
        if (!tokenvalue) return msg.reply(process.env.MESSAGE_ERROR)

        await axios.post('https://soundcloudmp3.org/converter', { _token: tokenvalue, url: fullArgs }, { headers: { "content-type": "application/x-www-form-urlencoded;", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36", "Cookie": token['headers']['set-cookie'] } })
            .then(({ data }) => {
                let $ = cheerio.load(data)
                let fileurl = $('#download-btn').attr('href')

                if (!fileurl) return msg.reply(process.env.MESSAGE_ERROR)
                return msg.replyAudio({ url: fileurl })
            })
            .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
    }
}