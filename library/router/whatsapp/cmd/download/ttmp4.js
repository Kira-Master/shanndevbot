const fetch = require('node-fetch')

module.exports = {
    wait: true,
    category: 'Download',
    aliases: ['ttv', 'tiktokvideo'],
    example: process.env.MESSAGE_NOURL,
    callback: async ({ msg, fullArgs }) => {
        if (!/https:|https:/.test(fullArgs) || !/tiktok.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)

        let formdata = new URLSearchParams({ url: fullArgs })
        await fetch('https://api.tikmate.app/api/lookup', { method: 'POST', body: formdata })
            .then(async (result) => {
                let json = await result.json()
                if (!json || !json.success) return msg.reply(process.env.MESSAGE_ERROR)

                return msg.replyVideo({ url: `https://tikmate.app/download/${json.token}/${json.id}.mp4?hd=1` })
            })
            .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
    }
}