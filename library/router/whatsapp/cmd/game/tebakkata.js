const _collection = new Map()
const { lolhuman } = require('@server/whatsapp/message/handler/myfunc')

module.exports = {
    category: 'Game',
    callback: async ({ msg }) => {
        if (_collection.get(msg.from)) return

        let data = await lolhuman('tebak/kata?')
        if (data.status && data.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

        let question = await msg.reply(`[ *TEBAK KATA* ]
            
Jawablah pertanyaan di bawah ini
${data.pertanyaan}

Waktu: 45 detik`)
        _collection.set(msg.from, question)

        msg.createMessageCollector({ filter: data.jawaban.toLowerCase(), max: 1, time: 45000 })
            .on('collect', msg => { msg.reply(`Jawaban benar\nJawaban : *${data.jawaban}*`) })
            .on('end', res => {
                _collection.delete(msg.from)

                if (res == 'timeout') {
                    msg.reply(`Waktu habis...\nJawaban : *${data.jawaban}*`, question)
                }
            })
    }
}