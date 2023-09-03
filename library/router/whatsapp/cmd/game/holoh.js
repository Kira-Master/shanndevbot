module.exports = {
    category: 'Game',
    example: process.env.MESSAGE_NOQUERY,
    callback: async ({ msg, fullArgs }) => {
        return msg.reply(fullArgs.replace(/a|i|u|e|o/g, 'o'))
    }
}