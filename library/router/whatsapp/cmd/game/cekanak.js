module.exports = {
    category: 'Game',
    callback: async ({ msg }) => {
        return msg.reply('Kamu akan mempunyai ' + Math.floor(Math.random() * 100) + ' anak setelah menikah nanti')
    }
}