module.exports = {
    wait: true,
    category: 'Tools',
    example: 'Contoh penggunaan : .shortlink https://www.facebook.com/',
    callback: async ({ msg, fullArgs }) => {
        if (!fullArgs.startsWith('http')) return msg.reply(`Contoh penggunaan: \n${prefix + command} https://domainku.com`)

        await axios.get('https://tinyurl.com/api-create.php?url=' + fullArgs)
            .then(({ data }) => { return msg.reply(data) })
            .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
    }
}