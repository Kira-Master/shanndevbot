const fetch = require('node-fetch')

module.exports = {
    wait: true,
    categoty: 'Download',
    aliases: ['ig', 'igdl'],
    example: process.env.MESSAGE_NOURL,
    callback: async ({ msg, fullArgs }) => {
        if (!/https:|https:/.test(fullArgs) || !/instagram.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)

        let formdata = { k_query: fullArgs, q_auto: 0, ajax: 1, k_page: 'instagram' }
        await fetch('https://www.y2mate.com/mates/analyzeV2/ajax', { method: 'POST', headers: { accept: "*/*", 'accept-language': "en-US,en;q=0.9", 'content-type': "application/x-www-form-urlencoded; charset=UTF-8" }, body: Object.keys(formdata).map(key => `${key}=${encodeURIComponent(formdata[key])}`).join('&') })
            .then(async (result) => {
                let json = await result.json()
                if (!json || json.status !== 'ok') return msg.reply(process.env.MESSAGE_ERROR)

                for (let media of json.links.video) {
                    if (/video/.test(media.q_text)) msg.replyVideo({ url: media.url })
                    if (/image/.test(media.q_text)) msg.replyImage({ url: media.url })
                }
            })
            .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
    }
}