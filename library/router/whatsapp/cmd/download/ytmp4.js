const fetch = require('node-fetch')

module.exports = {
    wait: true,
    aliases: ['ytmp3'],
    category: 'Download',
    example: process.env.MESSAGE_NOURL,
    callback: async ({ msg, fullArgs }) => {
        if (!/https:|http:/.test(fullArgs) || !/youtube.com|youtu.be/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)

        let formdata = { k_query: fullArgs, q_auto: 0, ajax: 1, k_page: 'instagram' }
        await fetch('https://www.y2mate.com/mates/analyzeV2/ajax', { method: 'POST', headers: { accept: "*/*", 'accept-language': "en-US,en;q=0.9", 'content-type': "application/x-www-form-urlencoded; charset=UTF-8" }, body: Object.keys(formdata).map(key => `${key}=${encodeURIComponent(formdata[key])}`).join('&') })
            .then(async (result) => {
                let json = await result.json()
                if (!json || json.status !== 'ok') return msg.reply(process.env.MESSAGE_ERROR)

                let vid = json.vid
                let k = json.links.mp4['18'].k

                await fetch('https://www.y2mate.com/mates/convertV2/index', { method: 'POST', body: new URLSearchParams({ vid, k }) })
                    .then(async (result) => {
                        let json = await result.json()
                        if (!json || json.status !== 'ok') return msg.reply(process.env.MESSAGE_ERROR)

                        return msg.replyVideo({ url: json.dlink })
                    })
            })
            .catch(() => msg.reply(process.env.MESSAGE_ERROR))
    }
}