const axios = require('axios')
const cheerio = require('cheerio')
const request = require('request')
const { writeExifImg } = require('@router/exif')

module.exports = {
    wait: true,
    category: 'Sticker',
    example: 'Contoh penggunaan: .ttp Bot Whatsapp',
    callback: async ({ msg, fullArgs }) => {
        let options = { method: 'POST', url: `https://www.picturetopeople.org/p2p/text_effects_generator.p2p/transparent_text_effect`, headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36", "Cookie": "_ga=GA1.2.1667267761.1655982457; _gid=GA1.2.77586860.1655982457; __gads=ID=c5a896288a559a38-224105aab0d30085:T=1655982456:RT=1655982456:S=ALNI_MbtHcmgQmVUZI-a2agP40JXqeRnyQ; __gpi=UID=000006149da5cba6:T=1655982456:RT=1655982456:S=ALNI_MY1RmQtva14GH-aAPr7-7vWpxWtmg; _gat_gtag_UA_6584688_1=1" }, formData: { 'TextToRender': fullArgs, 'FontSize': '100', 'Margin': '30', 'LayoutStyle': '0', 'TextRotation': '0', 'TextColor': 'ffffff', 'TextTransparency': '0', 'OutlineThickness': '3', 'OutlineColor': '000000', 'FontName': 'Lekton', 'ResultType': 'view' } }

        await request(options, async (error, response, body) => {
            if (error) return msg.reply(process.env.MESSAGE_ERROR)

            let $ = cheerio.load(body)
            let { data } = await axios.get('https://www.picturetopeople.org' + $('.result_img').attr('src'), { responseType: 'arraybuffer' })
            let fileexif = await writeExifImg(data, { packname: 'Bot', author: 'Whatsapp' })

            return msg.replySticker({ url: fileexif })
        })
    }
}