const { lolhuman } = require('@router/myfunc')

module.exports = {
    category: 'Random Text',
    callback: async ({ msg }) => {
        let filedata = await lolhuman('ceritahoror?')
        if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

        return msg.replyImage({ url: filedata.thumbnail }, `*[ ${filedata.title} ]*\n\n${filedata.desc}`)
    }
}