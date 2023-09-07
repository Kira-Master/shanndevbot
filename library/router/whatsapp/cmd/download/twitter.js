const { lolhuman } = require('@server/whatsapp/message/handler/myfunc')

module.exports = {
    wait: true,
    aliases: ['x'],
    category: 'Download',
    example: process.env.MESSAGE_NOURL,
    callback: async ({ msg, fullArgs }) => {
        if (!/https:|https:/.test(fullArgs) || !/twitter.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
        let data = await lolhuman('twitter?url=' + fullArgs)

        if (!data || data.status && data.status === 500) return msg.reply(process.env.MESSAGE_ERROR)
        for (let a of data.media) {
            if (a.type === 'photo') {
                msg.replyImage({ url: a.url })
            } else {
                msg.replyVideo({ url: a.url })
            }
        }
    }
}