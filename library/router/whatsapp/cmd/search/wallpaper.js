module.exports = {
    wait: true,
    category: 'Search',
    example: process.env.MESSAGE_NOQUERY,
    callback: async ({ msg, fullArgs }) => {
        return msg.replyImage({ url: `https://api.lolhuman.xyz/api/wallpaper?apikey=${process.env.APIKEY}&query=${fullArgs}` }).catch(() => msg.reply(fullArgs + ' Tidak ditemukan'))
    }
}