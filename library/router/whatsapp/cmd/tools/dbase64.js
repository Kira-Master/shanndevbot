module.exports = {
    category: 'Tools',
    example: 'Contoh penggunaan : .dbase64 VGVzdGVy',
    callback: async ({ msg, fullArgs }) => {
        if (fullArgs.length >= 2048) return msg.reply('Maximal 2.048 String!')
        return msg.reply(Buffer.from(fullArgs, 'base64').toString('ascii'))
    }
}