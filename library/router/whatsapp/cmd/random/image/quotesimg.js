const { lolhuman } = require('@router/myfunc')

module.exports = {
    category: 'Random Image',
    callback: async ({ msg }) => {
        let data = await lolhuman('random/quotesimage?')
        if (data.status && data.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

        return msg.reply(data)
    }
}