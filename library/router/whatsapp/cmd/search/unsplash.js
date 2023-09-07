const { lolhuman } = require('@router/myfunc')

module.exports = {
    wait: true,
    category: 'Search',
    example: process.env.MESSAGE_NOQUERY,
    callback: async ({ msg, fullArgs }) => {
        let data = await lolhuman('unsplash?query=' + fullArgs)
        if (!data || data.status && data.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

        return msg.replyImage({ url: data[Math.floor(Math.random() * data.length)] }).catch(() => msg.reply(process.env.MESSAGE_ERROR))
    }
}