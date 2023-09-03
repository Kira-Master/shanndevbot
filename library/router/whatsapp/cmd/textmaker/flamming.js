module.exports = {
    wait: true,
    category: 'Text Maker',
    callback: async ({ msg, fullArgs, command, prefix }) => {
        if (!fullArgs) return msg.reply(`Contoh penggunaan:\n${prefix + command} text`)
        return msg.replyImage({ url: `https://api.lolhuman.xyz/api/photooxy1/${command}?apikey=${process.env.APIKEY}&text=${fullArgs}` }).catch(() => msg.reply(process.env.MESSAGE_ERROR))
    }
}