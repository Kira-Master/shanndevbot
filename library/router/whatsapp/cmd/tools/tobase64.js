module.exports = {
    wait: true,
    category: 'Tools',
    callback: async ({ msg, prefix, command }) => {
        if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
            let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
            return msg.reply('data:image/jpg;base64,' + file.toString('base64'))
        } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command}', prefix + command))
    }
}