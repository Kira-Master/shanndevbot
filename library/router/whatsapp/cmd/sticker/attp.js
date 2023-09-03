const { writeExifVid } = require('@router/exif')

module.exports = {
    wait: true,
    category: 'Sticker',
    example: 'Contoh penggunaan: .attp Bot Whatsapp',
    callback: async ({ msg, fullArgs }) => {
        let getid = await axios.get('https://id.bloggif.com/text')
        let id = cheerio.load(getid.data)('#content > form').attr('action')
        let options = { method: "POST", url: `https://id.bloggif.com${id}`, headers: { "content-type": 'application/x-www-form-urlencoded', "user-agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36' }, formData: { target: 1, text: fullArgs, glitter_id: Math.floor(Math.random() * 2821), font_id: 'genuine', size: 90, bg_color: 'FFFFFF', transparent: 1, border_color: '000000', border_width: 1, shade_color: '000000', shade_width: 1, angle: 0, text_align: 'center' } }

        await request(options, async (error, response, body) => {
            if (error) return msg.reply(process.env.MESSAGE_ERROR)

            let $ = cheerio.load(body)
            let url = $('div#content > div.box > a').attr('href')

            let { data } = await axios.get('https://id.bloggif.com' + url, { responseType: 'arraybuffer' })
            let fileexif = await writeExifVid(data, { packname: 'Bot', author: 'Whatsapp' })

            msg.replySticker({ url: fileexif }).catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
        })
    }
}