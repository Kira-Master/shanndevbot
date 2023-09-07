const axios = require('axios')
const { lolhuman } = require('@router/myfunc')

module.exports = {
    wait: true,
    category: 'Download',
    example: process.env.MESSAGE_NOURL,
    callback: async ({ msg, fullArgs }) => {
        if (!/https:|http:/.test(fullArgs) || !/pinterest.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)

        let data = await lolhuman('pinterestdl?url=' + fullArgs)
        if (data.status && data.status === 500) return msg.reply(process.env.ERROR)

        let { headers } = await axios.get(data)
        if (!headers) return msg.reply(data)

        if (/image/.test(headers['content-type'])) return msg.replyImage({ url: data })
        if (/video/.test(headers['content-type'])) return msg.replyVideo({ url: data })
    }
}