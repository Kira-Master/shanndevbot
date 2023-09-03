module.exports = {
    category: 'Tools',
    example: 'Contoh penggunaan : .ebase64 Tester',
    callback: async ({ msg, fullArgs }) => {
        if (fullArgs.length >= 2048) return msg.reply('Maximal 2.048 String!')
        return msg.reply(Buffer.from(fullArgs).toString('base64'))
    }
}