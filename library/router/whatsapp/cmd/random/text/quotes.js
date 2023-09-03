const { lolhuman } = require('@router/myfunc')

module.exports = {
    category: 'Random Text',
    callback: async ({ msg }) => {
        let filedata = await lolhuman('random/quotes?')
        if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

        return msg.reply(`${filedata.quote}\n\n- _*${filedata.by}*_`)
    }
}