const yts = require('yt-search')
const fetch = require('node-fetch')

module.exports = {
    wait: true,
    category: 'Search',
    example: 'Contoh penggunaan :\n.play Nanti - Payung teduh\n.play Nanti - Payung teduh --doc\n.play Nanti - Payung teduh --video',
    callback: async ({ msg, fullArgs }) => {
        let options = (fullArgs.split(' --')) ? fullArgs.split(' --')[1] : undefined
        let query = (options) ? fullArgs.split(' --')[0] : fullArgs

        let getId = await yts({ query })
        if (!getId) return msg.reply('Gagal, video tidak ditemukan')

        let formdata = { k_query: getId.videos[0].url, q_auto: 0, ajax: 1, k_page: 'instagram' }
        await fetch('https://www.y2mate.com/mates/analyzeV2/ajax', { method: 'POST', headers: { accept: "*/*", 'accept-language': "en-US,en;q=0.9", 'content-type': "application/x-www-form-urlencoded; charset=UTF-8" }, body: Object.keys(formdata).map(key => `${key}=${encodeURIComponent(formdata[key])}`).join('&') })
            .then(async (result) => {
                let json = await result.json()
                if (!json || json.status !== 'ok') return msg.reply(process.env.MESSAGE_ERROR)

                let vid = json.vid
                let k = (options && options === 'doc') ? json.links.mp3['mp3128'].k : json.links.mp4['18'].k

                await fetch('https://www.y2mate.com/mates/convertV2/index', { method: 'POST', body: new URLSearchParams({ vid, k }) })
                    .then(async (result) => {
                        let json = await result.json()
                        if (!json || json.status !== 'ok') return msg.reply(process.env.MESSAGE_ERROR)

                        if (options && options === 'video') return msg.replyVideo({ url: json.dlink })
                        else if (options && options === 'doc') return msg.replyDocument({ url: json.dlink }, 'audio/mp3', getId.videos[0].title + '.mp3')
                        else return msg.replyAudio({ url: json.dlink })
                    })
            })
            .catch(() => msg.reply(process.env.MESSAGE_ERROR))
    }
}