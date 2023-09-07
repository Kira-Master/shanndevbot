const axios = require('axios')

module.exports = {
    wait: true,
    category: 'Tools',
    example: process.env.MESSAGE_NOURL,
    callback: async ({ msg, fullArgs }) => {
        if (!/https:|http:/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
        await axios.get(fullArgs, { responseType: 'arraybuffer' })
            .then(({ headers }) => {
                if (!headers || !/image/.test(headers['content-type'])) return msg.reply(process.env.MESSAGE_NOURL)
                return msg.replyImage({ url: fullArgs })
            })
            .catch(() => msg.reply(process.env.MESSAGE_ERROR))
    }
}