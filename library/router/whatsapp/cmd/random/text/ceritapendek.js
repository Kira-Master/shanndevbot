const { lolhuman } = require('@router/myfunc')

module.exports = {
    category: 'Random Text',
    callback: async ({ msg }) => {
        let filedata = await lolhuman('cerpen?')
        if (!filedata || filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

        return msg.reply(`*[ ${filedata.title} ]*\n\n${filedata.cerpen}\n\n- _*${filedata.creator}*_`)
    }
}