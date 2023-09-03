module.exports = {
    wait: true,
    category: 'Text Maker',
    callback: async ({ msg, fullArgs, command, prefix }) => {
        if (!fullArgs) return msg.reply(`Contoh penggunaan:\n${prefix + command} text1|text2`)
        let [text1, text2] = fullArgs.split('|')
        if (!text2) return msg.reply(`Contoh penggunaan:\n${prefix + command} text1|text2`)

        return msg.replyImage({ url: `https://api.lolhuman.xyz/api/photooxy2/${command}?apikey=${process.env.APIKEY}&text1=${text1}&text2=${text2}` }).catch(() => msg.reply(process.env.MESSAGE_ERROR))
    }
}