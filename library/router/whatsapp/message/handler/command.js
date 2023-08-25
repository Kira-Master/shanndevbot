const fs = require('fs')
const axios = require('axios')
const { toVideo, sleep } = require('@server/whatsapp/message/handler/converter')
const { telegraph, uploadFile } = require('@server/whatsapp/message/handler/myfunc')
const { writeExif, writeExifImg, writeExifVid } = require('@server/whatsapp/message/handler/exif')

module.exports = async ({ client, msg, prefix, args, command }) => {
    let fullArgs = args.join()

    switch (command) {
        case 'menu': case 'help': case 'list': {
            let menuText = `*DOWNLOAD*
• ${prefix}facebook
• ${prefix}instagram
• ${prefix}mediafire
• ${prefix}soundcloud
• ${prefix}tiktok
• ${prefix}twitter
• ${prefix}youtube

*GAME*
• ${prefix}judi
• ${prefix}cekanak
• ${prefix}cekmati
• ${prefix}ceknikah

*GROUP*
• ${prefix}add
• ${prefix}demote
• ${prefix}kick
• ${prefix}promote

*RANDOM*
• ${prefix}quotes
• ${prefix}quotesnime

*SEARCH*
• ${prefix}pinterest
• ${prefix}stickerpack
• ${prefix}wikimedia
• ${prefix}wikipedia

*STICKER*
• ${prefix}s
• ${prefix}take

*TOOLS*
• ${prefix}halah
• ${prefix}heleh
• ${prefix}hilih
• ${prefix}holoh
• ${prefix}huluh
• ${prefix}remini
• ${prefix}removebg
• ${prefix}ssweb

- _*Bot by @shanndev28*_`

            await msg.reply(menuText)
            break
        }

        // ========== [ GABUT ] ========== \\
        case 'cekmati': case 'ceknikah': case 'cekanak': case 'judi': {
            await msg.reply('_*Loading...*_')

            let randomDay = [' Tahun', ' Bulan', ' Minggu', ' Hari', ' Jam', ' Menit', ' Detik']
            let hasilDay = randomDay[Math.floor(Math.random() * 100)]
            let hasilNumber = Math.floor(Math.random() * 100)

            let hasilPemain = Math.floor(Math.random() * 75)
            let hasilBandar = Math.floor(Math.random() * 100)

            let menangKalah = (hasilBandar > hasilPemain) ? 'Kalah' : (hasilBandar === hasilPemain) ? 'Imbang' : 'Menang'

            await sleep(2000)

            if (command === 'cekmati') return msg.reply(`${hasilNumber + hasilDay} lagi kamu akan mati`)
            if (command === 'ceknikah') return msg.reply(`${hasilNumber + hasilDay} lagi kamu akan menikah`)
            if (command === 'cekanak') return msg.reply(`Kamu akan memiliki ${hasilNumber} anak setelah menikah`)
            if (command === 'judi') return msg.reply(`${hasilBandar} : ${hasilPemain}\n\nKamu *${menangKalah}* melawan bandar`)

            break
        }

        // ========== [ GROUP ] ========== \\
        case 'add': case 'kick': case 'demote': case 'promote': {
            if (!msg.isGroup || (msg.isGroup && !msg.groupMetadata.participants.filter((v) => v.admin).map((v) => v.id).includes(msg.sender))) return

            await msg.reply('_*Loading...*_')

            if (!fullArgs) return msg.reply(prefix + command + ' nomor\n\n- _*Nomor wajib diawali dengan country code*_')
            let user = msg.quoted ? msg.quoted.sender : args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'

            if (command === 'add') return await client.groupParticipantsUpdate(msg.from, [user], 'add').then(() => { return msg.reply('success') }).catch(() => { return msg.reply('failed') })
            if (command === 'kick') return await client.groupParticipantsUpdate(msg.from, [user], 'remove').then(() => { return msg.reply('success') }).catch(() => { return msg.reply('failed') })
            if (command === 'demote') return await client.groupParticipantsUpdate(msg.from, [user], 'demote').then(() => { return msg.reply('success') }).catch(() => { return msg.reply('failed') })
            if (command === 'promote') return await client.groupParticipantsUpdate(msg.from, [user], 'promote').then(() => { return msg.reply('success') }).catch(() => { return msg.reply('failed') })

            break
        }

        // ========== [ CONVERT ] ========== \\
        case 'halah': case 'hilih': case 'heleh': case 'holoh': {
            await msg.reply('_*Loading...*_')

            if (!fullArgs) return msg.reply('Text?')
            if (command === 'halah') return msg.reply(fullArgs.replace(/a|i|u|e|o/g, 'a'))
            if (command === 'hilih') return msg.reply(fullArgs.replace(/a|i|u|e|o/g, 'i'))
            if (command === 'huluh') return msg.reply(fullArgs.replace(/a|i|u|e|o/g, 'u'))
            if (command === 'heleh') return msg.reply(fullArgs.replace(/a|i|u|e|o/g, 'e'))
            if (command === 'holoh') return msg.reply(fullArgs.replace(/a|i|u|e|o/g, 'o'))

            break
        }

        case 'remini': {
            await msg.reply('_*Loading...*_')

            if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
                let path = `remini-${Date.now()}.jpg`
                let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))

                await fs.writeFileSync(path, file)
                let url = await telegraph(path)

                await axios.get('https://shanndevapi.com/api/converter/remini?img=' + url, { responseType: 'arraybuffer' })
                    .then(async (result) => {
                        if (!result || !result.data || !result.headers['content-type'] || !/image/.test(result.headers['content-type'])) return msg.reply('Error, silahkan coba lagi nanti').then(async () => { return await fs.unlinkSync(path) })
                        await fs.writeFileSync(path, result.data)

                        await msg.replyImage({ url: path })
                        await fs.unlinkSync(path)
                    })
                    .catch(async () => { return msg.reply('Error, silahkan coba lagi nanti').then(async () => { return await fs.unlinkSync(path) }) })
            } else {
                msg.reply(`_*Kirim/Balas gambar dengan caption ${prefix + command}*_`)
            }

            break
        }

        case 'removebg': {
            await msg.reply('_*Loading...*_')

            if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
                let path = `removebg-${Date.now()}.jpg`
                let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))

                await fs.writeFileSync(path, file)
                let url = await telegraph(path)

                await axios.get('https://shanndevapi.com/api/converter/removebg?img=' + url, { responseType: 'arraybuffer' })
                    .then(async (result) => {
                        if (!result || !result.data || !result.headers['content-type'] || !/image/.test(result.headers['content-type'])) return msg.reply('Error, silahkan coba lagi nanti').then(async () => { return await fs.unlinkSync(path) })
                        await fs.writeFileSync(path, result.data)

                        await msg.replyImage({ url: path })
                        await fs.unlinkSync(path)
                    })
                    .catch(() => { return msg.reply('Error, silahkan coba lagi nanti').then(async () => { return await fs.unlinkSync(path) }) })
            } else {
                msg.reply(`_*Kirim/Balas gambar dengan caption ${prefix + command}*_`)
            }

            break
        }

        case 'ssweb': {
            await msg.reply('_*Loading...*_')

            if (!/http:|https:/.test(fullArgs)) return msg.reply('Masukkan url dengan benar')
            await axios.get('https://shanndevapi.com/api/converter/ssweb?w=1200&h=628&url=' + fullArgs, { responseType: 'arraybuffer' })
                .then(async (result) => {
                    if (!result || !result.data || !result.headers['content-type'] || !/image/.test(result.headers['content-type'])) return msg.reply('Error, silahkan coba lagi nanti')

                    let path = `ssweb-${Date.now()}.jpg`
                    await fs.writeFileSync(path, result.data)

                    await msg.replyImage({ url: path })
                    await fs.unlinkSync(path)
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        // ========== [ STICKER ] ========== \\
        case 'sticker': case 'stiker': case 's': {
            await msg.reply('_*Loading...*_')

            let [packname, author] = fullArgs ? fullArgs.split('|') : 'Bot|Whatsapp'.split('|')
            if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
                let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
                let fileurl = await writeExif({ mimetype: 'image', data: file }, { packname, author })

                await msg.replySticker({ url: fileurl })
            } else if (msg.typeCheck.isVideo || msg.typeCheck.isQuotedVideo) {
                let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
                let fileurl = await writeExif({ mimetype: 'video', data: file }, { packname, author })

                await msg.replySticker({ url: fileurl })
            } else return msg.reply('Kirim gambar atau video dengan caption ' + prefix + command)

            break
        }

        case 'take': {
            await msg.reply('_*Loading...*_')

            let [packname, author] = fullArgs ? fullArgs.split('|') : 'Bot|Whatsapp'.split('|')
            if (msg.typeCheck.isQuotedSticker) {
                let file = await msg.quoted.download('buffer')
                let fileurl = await writeExif({ mimetype: 'webp', data: file }, { packname, author })

                await msg.replySticker({ url: fileurl })
            } else return msg.reply('Kirim sticker lalu reply dengan caption ' + prefix + command + ' packname|author')

            break
        }

        // ========== [ SEARCHER ] ========== \\
        case 'pinterest': {
            await msg.reply('_*Loading...*_')

            if (!fullArgs) return msg.reply('Query?')
            await axios.get('https://shanndevapi.com/api/searcher/pinterest?query=' + fullArgs)
                .then(({ data }) => {
                    if (!data || !data.status || !data.result) return msg.reply('Error, silahkan coba lagi nanti')
                    let urlRandom = data.result[Math.floor(Math.random() * data.result.length)]

                    return msg.replyImage({ url: urlRandom })
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        case 'wikimedia': {
            await msg.reply('_*Loading...*_')

            if (!fullArgs) return msg.reply('Query?')
            await axios.get('https://shanndevapi.com/api/searcher/wikimedia?query=' + fullArgs)
                .then(({ data }) => {
                    if (!data || !data.status || !data.result) return msg.reply('Error, silahkan coba lagi nanti')
                    let urlRandom = data.result[Math.floor(Math.random() * data.result.length)]

                    return msg.replyImage({ url: urlRandom })
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        case 'wikipedia': {
            await msg.reply('_*Loading...*_')

            if (!fullArgs) return msg.reply('Query?')
            await axios.get('https://shanndevapi.com/api/searcher/wikipedia?query=' + fullArgs)
                .then(({ data }) => {
                    if (!data || !data.status || !data.result) return msg.reply('Error, silahkan coba lagi nanti')
                    return msg.replyImage({ url: data.result.image }, data.result.artikel)
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        case 'stickerpack': {
            await msg.reply('_*Loading...*_')

            if (!fullArgs) return msg.reply('Query?')
            await axios.get('https://shanndevapi.com/api/searcher/stickerpack?query=' + fullArgs, { responseType: 'arraybuffer' })
                .then(async (result) => {
                    if (!result || !result.data || !result.headers || !/image/.test(result.headers['content-type'])) return msg.reply('Error, silahkan coba lagi nanti')
                    let file = await writeExif({ data: result.data, mimetype: result.headers['content-type'] }, { packname: 'Bot', author: 'Whatsapp' })

                    return msg.replySticker({ url: file })
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        // ========== [ DOWNLOAD ] ========== \\
        case 'instagram': {
            await msg.reply('_*Loading...*_')

            if (!/http:|https:/.test(fullArgs) && !/instagram/.test(fullArgs)) return msg.reply('Error, silahkan coba lagi nanti')
            await axios.get('https://shanndevapi.com/api/downloader/instagram?url=' + fullArgs)
                .then(async ({ data }) => {
                    if (!data || !data.status || !data.result.video) return msg.reply('Error, silahkan coba lagi nanti')

                    for (let video of data.result.video) {
                        await axios.get(video.url)
                            .then(result => {
                                console.log(video.url)
                                if (/image/.test(result.headers['content-type'])) msg.replyImage({ url: video.url }).catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })
                                if (/video/.test(result.headers['content-type'])) msg.replyVideo({ url: video.url }).catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })
                            })
                            .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })
                    }
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        case 'facebook': {
            await msg.reply('_*Loading...*_')

            if (!/http:|https:/.test(fullArgs) && !/facebook.com|fb.watch/.test(fullArgs)) return msg.reply('Error, silahkan coba lagi nanti')
            await axios.get('https://shanndevapi.com/api/downloader/facebook?url=' + fullArgs)
                .then(({ data }) => {
                    if (!data || !data.status || !data.result || !data.result.hd) return msg.reply('Error, silahkan coba lagi nanti')
                    return msg.replyVideo({ url: data.result.hd.url }).catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        case 'twitter': {
            await msg.reply('_*Loading...*_')

            if (!/http:|https:/.test(fullArgs) && !/twitter.com/.test(fullArgs)) return msg.reply('Error, silahkan coba lagi nanti')
            await axios.get('https://shanndevapi.com/api/downloader/twitter?url=' + fullArgs)
                .then(async ({ data }) => {
                    if (!data || !data.status || !data.result) return msg.reply('Error, silahkan coba lagi nanti')

                    await axios.get(data.result.url, { responseType: 'arraybuffer' })
                        .then(async ({ data }) => {
                            let file = await toVideo(data, 'mp4')
                            let path = `twitter-${Date.now()}.mp4`
                            fs.writeFileSync(path, file)

                            await msg.replyVideo({ url: path })
                            return fs.unlinkSync(path)
                        })
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        case 'tiktok': {
            await msg.reply('_*Loading...*_')

            if (!/http:|https:/.test(fullArgs) && !/tiktok.com/.test(fullArgs)) return msg.reply('Error, silahkan coba lagi nanti')
            await axios.get('https://shanndevapi.com/api/downloader/tiktok?url=' + fullArgs)
                .then(({ data }) => {
                    if (!data || !data.status || !data.result || !data.result.video) return msg.reply('Error, silahkan coba lagi nanti')
                    return msg.replyVideo({ url: data.result.video[0].url }).catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        case 'youtube': {
            await msg.reply('_*Loading...*_')

            if (!/http:|https:/.test(fullArgs) && !/youtube.com|youtu.be/.test(fullArgs)) return msg.reply('Error, silahkan coba lagi nanti')
            await axios.get('https://shanndevapi.com/api/downloader/youtube?url=' + fullArgs)
                .then(({ data }) => {
                    if (!data || !data.status || !data.result.media) return msg.reply('Error, silahkan coba lagi nanti')

                    let file = data.result.media.find(a => a.filetype === 'mp4')
                    return msg.replyVideo({ url: file.url }).catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        case 'soundcloud': {
            await msg.reply('_*Loading...*_')

            if (!/http:|https:/.test(fullArgs) && !/soundcloud.com/.test(fullArgs)) return msg.reply('Error, silahkan coba lagi nanti')
            await axios.get('https://shanndevapi.com/api/downloader/soundcloud?url=' + fullArgs)
                .then(({ data }) => {
                    if (!data || !data.status || !data.result) return msg.reply('Error, silahkan coba lagi nanti')
                    return msg.replyAudio({ url: data.result }).catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        case 'mediafire': {
            await msg.reply('_*Loading...*_')

            if (!/http:|https:/.test(fullArgs) && !/mediafire.com/.test(fullArgs)) return msg.reply('Error, silahkan coba lagi nanti')
            await axios.get('https://shanndevapi.com/api/downloader/mediafire?url=' + fullArgs)
                .then(async ({ data }) => {
                    if (!data || !data.status || !data.result) return msg.reply('Error, silahkan coba lagi nanti')

                    await axios.get(data.result.url)
                        .then(result => {
                            return msg.replyDocument({ url: data.result.url }, result.headers['content-type'], data.result.filename).catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })
                        })
                        .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })

            break
        }

        // ========== [ RANDOM ] ========== \\
        case 'quotes': case 'quotesnime': {
            await msg.reply('_*Loading...*_')

            let url = 'https://shanndevapi.com/api/random/quotes'
            if (command === 'quotesnime') url = 'https://shanndevapi.com/api/random/quotesnime'

            await axios.get(url)
                .then(({ data }) => {
                    if (!data || !data.status || !data.result) return msg.reply('Error, silahkan coba lagi nanti')
                    return msg.reply(data.result.quote + '\n\n- _*' + data.result.name + '*_')
                })
                .catch(() => { return msg.reply('Error, silahkan coba lagi nanti') })


            break
        }
    }
}