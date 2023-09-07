module.exports = {
    wait: true,
    category: 'Tools',
    example: process.env.MESSAGE_NOQUERY,
    callback: async ({ msg, fullArgs }) => {
        return msg.replyAudio({ url: 'https://api.lolhuman.xyz/api/gtts/id?apikey=' + process.env.APIKEY + '&text=' + fullArgs }).catch(() => msg.reply(process.env.MESSAGE_ERROR))
    }
}