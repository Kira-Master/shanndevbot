const fs = require('fs')
const axios = require('axios')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const { downloadMedia, telegraph, uploadFile } = require('@server/whatsapp/message/handler/myfunc')
const { toAudio, toPTT, toVideo, ffmpeg, sleep } = require('@server/whatsapp/message/handler/converter')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid, writeExif } = require('@server/whatsapp/message/handler/exif')

module.exports = async ({ client, msg, prefix, args, command }) => {
    let fullArgs = args.join()

    switch (command) {
        case 'menu': case 'help': case 'list': {
            let menutext = fs.readFileSync('menu.txt', 'utf8')
            await msg.reply(menutext.replace(/{prefix}/g, prefix))

            break
        }

        // ========== [ DOWNLOAD ] ========== \\
        case 'facebook': case 'fb': {
            await msg.reply(process.env.MESSAGE_LOAD)

            if (!fullArgs || !/https:|http:/.test(fullArgs) || !/facebook.com|fb.watch/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
            await axios.post('https://getmyfb.com/process', { id: fullArgs, locale: 'en' })
                .then(async ({ data }) => {
                    let $ = cheerio.load(data)
                    let fileurl = $('ul.results-list > li:first-child > a').attr('href')

                    if (!fileurl) return msg.reply(process.env.MESSAGE_ERROR)
                    return msg.replyVideo({ url: fileurl })
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

            break
        }

        case 'instagram': case 'ig': {
            await msg.reply(process.env.MESSAGE_LOAD)

            if (!fullArgs || !/https:|https:/.test(fullArgs) || !/instagram.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
            let formdata = { k_query: fullArgs, q_auto: 0, ajax: 1, k_page: 'instagram' }

            await fetch('https://www.y2mate.com/mates/analyzeV2/ajax', { method: 'POST', headers: { accept: "*/*", 'accept-language': "en-US,en;q=0.9", 'content-type': "application/x-www-form-urlencoded; charset=UTF-8" }, body: Object.keys(formdata).map(key => `${key}=${encodeURIComponent(formdata[key])}`).join('&') })
                .then(async (result) => {
                    let json = await result.json()
                    if (json.status !== 'ok') return msg.reply(process.env.MESSAGE_ERROR)

                    for (let media of json.links.video) {
                        if (/video/.test(media.q_text)) msg.replyVideo({ url: media.url })
                        if (/image/.test(media.q_text)) msg.replyImage({ url: media.url })
                    }
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

            break
        }

        case 'mediafire': {
            await msg.reply(process.env.MESSAGE_LOAD)

            if (!fullArgs || !/https:|http:/.test(fullArgs) || !/mediafire.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
            await axios.get(fullArgs)
                .then(async ({ data }) => {
                    let $ = cheerio.load(data)
                    let filename = $('div.filename').text()
                    let fileurl = $('#downloadButton').attr('href')

                    await axios.get(fileurl).then(({ headers }) => { return msg.replyDocument({ url: fileurl }, headers['content-type'], filename) }).catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

            break
        }

        case 'soundcloud': {
            await msg.reply(process.env.MESSAGE_LOAD)

            if (!fullArgs || !/https:|https:/.test(fullArgs) || !/soundcloud.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)

            let token = await axios.get('https://soundcloudmp3.org/id')
            let $ = cheerio.load(token.data)

            let tokenvalue = $('form#conversionForm > input[type=hidden]').attr('value')
            if (!tokenvalue) return msg.reply(process.env.MESSAGE_ERROR)

            await axios.post('https://soundcloudmp3.org/converter', { _token: tokenvalue, url: fullArgs }, { headers: { "content-type": "application/x-www-form-urlencoded;", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36", "Cookie": token['headers']['set-cookie'] } })
                .then(({ data }) => {
                    let $ = cheerio.load(data)
                    let fileurl = $('#download-btn').attr('href')

                    if (!fileurl) return msg.reply(process.env.MESSAGE_ERROR)
                    return msg.replyAudio({ url: fileurl })
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

            break
        }

        case 'tiktokvideo': case 'tiktokaudio': case 'ttmp4': case 'ttmp3': {
            await msg.reply(process.env.MESSAGE_LOAD)

            if (!fullArgs || !/https:|https:/.test(fullArgs) || !/tiktok.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
            await axios.get('https://tikmate.cc/analyze?url=' + fullArgs)
                .then(({ data }) => {
                    if (!data || data.error) return msg.reply(process.env.MESSAGE_ERROR)
                    let file = data.formats.video.find(a => a.fileType === 'mp4')

                    if (command === 'ttmp4' || command === 'tiktokvideo') return msg.replyVideo({ url: file.url })
                    if (command === 'ttmp3' || command === 'tiktokaudio') return msg.replyAudio({ url: file.url })
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

            break
        }

        case 'twitter': {
            await msg.reply(process.env.MESSAGE_LOAD)

            if (!fullArgs || !/https:|https:/.test(fullArgs) || !/twitter.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
            await axios.get('https://snaptwitter.com/')
                .then(async ({ data }) => {
                    let $ = cheerio.load(data)
                    let token = $('input[name="token"]').val()

                    let formdata = new URLSearchParams({ url: fullArgs, token })
                    await fetch('https://snaptwitter.com/action.php', { method: 'POST', body: formdata })
                        .then(async (result) => {
                            let json = await result.json()
                            let $ = cheerio.load(json.data)
                            let fileurl = 'https://snaptwitter.com' + $('.abuttons > a').attr('href')

                            await axios.get(fileurl, { responseType: 'arraybuffer' })
                                .then(async ({ data }) => {
                                    let fileurl = `twitter-${Date.now()}.mp4`
                                    let filebuffer = await toVideo(data, 'mp4')

                                    await fs.writeFileSync(fileurl, filebuffer)
                                    return msg.replyVideo({ url: fileurl }).then(() => fs.unlinkSync(fileurl)).catch(() => fs.unlinkSync(fileurl))
                                })
                                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
                        })
                        .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

            break
        }

        case 'youtubevideo': case 'youtubeaudio': case 'yta': case 'ytv': {
            await msg.reply(process.env.MESSAGE_LOAD)

            if (!fullArgs || !/https:|http:/.test(fullArgs) || !/youtube.com|youtu.be/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
            await axios.post('https://video-downloader.optizord.com/wp-json/aio-dl/video-data/', { url: fullArgs, token: 'f46b50094b28d24a8dbb563979b2326e021017d334b972393b10d06c2e1f9344' })
                .then(async ({ data }) => {
                    if (!data || !data.medias) return msg.reply(process.env.MESSAGE_ERROR)

                    let name = Date.now() + '.mp4'
                    let fileurl = (data.medias.find(a => a.audioAvailable === true && a.extension === 'mp4' && a.quality === '1080p')) ? data.medias.find(a => a.audioAvailable === true && a.extension === 'mp4' && a.quality === '10800p').url : (data.medias.find(a => a.audioAvailable === true && a.extension === 'mp4' && a.quality === '720p')) ? data.medias.find(a => a.audioAvailable === true && a.extension === 'mp4' && a.quality === '720p').url : (data.medias.find(a => a.audioAvailable === true && a.extension === 'mp4' && a.quality === '480p')) ? data.medias.find(a => a.audioAvailable === true && a.extension === 'mp4' && a.quality === '480p').url : (data.medias.find(a => a.audioAvailable === true && a.extension === 'mp4' && a.quality === '360p')) ? data.medias.find(a => a.audioAvailable === true && a.extension === 'mp4' && a.quality === '360p').url : (data.medias.find(a => a.audioAvailable === true && a.extension === 'mp4' && a.quality === '240p')) ? data.medias.find(a => a.audioAvailable === true && a.extension === 'mp4' && a.quality === '240p').url : data.medias.find(a => a.audioAvailable === true && a.extension === 'mp4' && a.quality === '144p').url

                    if (command === 'yta' || command === 'youtubeaudio') return msg.replyAudio({ url: fileurl })
                    if (command === 'ytv' || command === 'youtubevideo') return msg.replyDocument({ url: fileurl }, 'video/mp4', name)
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

            break
        }

        // ========== [ GABUT ] ========== \\
        case 'cekmati': case 'ceknikah': case 'cekanak': case 'judi': {
            await msg.reply(process.env.MESSAGE_LOAD)

            let randomDay = [' Tahun', ' Bulan', ' Minggu', ' Hari', ' Jam', ' Menit', ' Detik']
            let hasilDay = randomDay[Math.floor(Math.random() * 100)]
            let hasilNumber = Math.floor(Math.random() * 100)

            let hasilPemain = Math.floor(Math.random() * 75)
            let hasilBandar = Math.floor(Math.random() * 100)

            let menangKalah = (hasilBandar > hasilPemain) ? 'Kalah' : (hasilBandar === hasilPemain) ? 'Imbang' : 'Menang'

            await sleep(1000)

            if (command === 'cekmati') return msg.reply(`${hasilNumber + hasilDay} lagi kamu akan mati`)
            if (command === 'ceknikah') return msg.reply(`${hasilNumber + hasilDay} lagi kamu akan menikah`)
            if (command === 'cekanak') return msg.reply(`Kamu akan memiliki ${hasilNumber} anak setelah menikah`)
            if (command === 'judi') return msg.reply(`${hasilBandar} : ${hasilPemain}\n\nKamu *${menangKalah}* melawan bandar`)

            break
        }

        case 'halah': case 'hilih': case 'heleh': case 'holoh': {
            await msg.reply(process.env.MESSAGE_LOAD)
            if (!fullArgs) return msg.reply(process.env.MESSAGE_NOQUERY)

            if (command === 'halah') return msg.reply(fullArgs.replace(/a|i|u|e|o/g, 'a'))
            if (command === 'hilih') return msg.reply(fullArgs.replace(/a|i|u|e|o/g, 'i'))
            if (command === 'huluh') return msg.reply(fullArgs.replace(/a|i|u|e|o/g, 'u'))
            if (command === 'heleh') return msg.reply(fullArgs.replace(/a|i|u|e|o/g, 'e'))
            if (command === 'holoh') return msg.reply(fullArgs.replace(/a|i|u|e|o/g, 'o'))

            break
        }

        // ========== [ GROUP ] ========== \\
        case 'add': case 'kick': case 'demote': case 'promote': {
            if (!msg.isGroup || (msg.isGroup && !msg.groupMetadata.participants.filter((v) => v.admin).map((v) => v.id).includes(msg.sender))) return

            await msg.reply(process.env.MESSAGE_LOAD)

            if (!fullArgs) return msg.reply(process.env.MESSAGE_NOQUERY)
            let user = msg.quoted ? msg.quoted.sender : args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'

            if (command === 'add') return await client.groupParticipantsUpdate(msg.from, [user], 'add').then(() => { return msg.reply('success') }).catch(() => { return msg.reply('failed') })
            if (command === 'kick') return await client.groupParticipantsUpdate(msg.from, [user], 'remove').then(() => { return msg.reply('success') }).catch(() => { return msg.reply('failed') })
            if (command === 'demote') return await client.groupParticipantsUpdate(msg.from, [user], 'demote').then(() => { return msg.reply('success') }).catch(() => { return msg.reply('failed') })
            if (command === 'promote') return await client.groupParticipantsUpdate(msg.from, [user], 'promote').then(() => { return msg.reply('success') }).catch(() => { return msg.reply('failed') })

            break
        }

        // ========== [ SEARCH ] ========== \\
        case 'pinterest': {
            await msg.reply(process.env.MESSAGE_LOAD)
            if (!fullArgs) return msg.reply(process.env.MESSAGE_NOQUERY)

            await axios({ method: 'get', url: 'https://id.pinterest.com/search/pins/?autologin=true&q=' + fullArgs, headers: { "cookie": "_auth=1; _b=\"AVna7S1p7l1C5I9u0+nR3YzijpvXOPc6d09SyCzO+DcwpersQH36SmGiYfymBKhZcGg=\"; _pinterest_sess=TWc9PSZHamJOZ0JobUFiSEpSN3Z4a2NsMk9wZ3gxL1NSc2k2NkFLaUw5bVY5cXR5alZHR0gxY2h2MVZDZlNQalNpUUJFRVR5L3NlYy9JZkthekp3bHo5bXFuaFZzVHJFMnkrR3lTbm56U3YvQXBBTW96VUgzVUhuK1Z4VURGKzczUi9hNHdDeTJ5Y2pBTmxhc2owZ2hkSGlDemtUSnYvVXh5dDNkaDN3TjZCTk8ycTdHRHVsOFg2b2NQWCtpOWxqeDNjNkk3cS85MkhhSklSb0hwTnZvZVFyZmJEUllwbG9UVnpCYVNTRzZxOXNJcmduOVc4aURtM3NtRFo3STlmWjJvSjlWTU5ITzg0VUg1NGhOTEZzME9SNFNhVWJRWjRJK3pGMFA4Q3UvcHBnWHdaYXZpa2FUNkx6Z3RNQjEzTFJEOHZoaHRvazc1c1UrYlRuUmdKcDg3ZEY4cjNtZlBLRTRBZjNYK0lPTXZJTzQ5dU8ybDdVS015bWJKT0tjTWYyRlBzclpiamdsNmtpeUZnRjlwVGJXUmdOMXdTUkFHRWloVjBMR0JlTE5YcmhxVHdoNzFHbDZ0YmFHZ1VLQXU1QnpkM1FqUTNMTnhYb3VKeDVGbnhNSkdkNXFSMXQybjRGL3pyZXRLR0ZTc0xHZ0JvbTJCNnAzQzE0cW1WTndIK0trY05HV1gxS09NRktadnFCSDR2YzBoWmRiUGZiWXFQNjcwWmZhaDZQRm1UbzNxc21pV1p5WDlabm1UWGQzanc1SGlrZXB1bDVDWXQvUis3elN2SVFDbm1DSVE5Z0d4YW1sa2hsSkZJb1h0MTFpck5BdDR0d0lZOW1Pa2RDVzNySWpXWmUwOUFhQmFSVUpaOFQ3WlhOQldNMkExeDIvMjZHeXdnNjdMYWdiQUhUSEFBUlhUVTdBMThRRmh1ekJMYWZ2YTJkNlg0cmFCdnU2WEpwcXlPOVZYcGNhNkZDd051S3lGZmo0eHV0ZE42NW8xRm5aRWpoQnNKNnNlSGFad1MzOHNkdWtER0xQTFN5Z3lmRERsZnZWWE5CZEJneVRlMDd2VmNPMjloK0g5eCswZUVJTS9CRkFweHc5RUh6K1JocGN6clc1JmZtL3JhRE1sc0NMTFlpMVErRGtPcllvTGdldz0=; _ir=0" } })
                .then(({ data }) => {
                    let fileurl = []
                    let $ = cheerio.load(data)

                    $('div > a').get().map(b => {
                        let url = $(b).find('img').attr('src')
                        if (url === undefined || /75x75_RS/.test(url)) return

                        fileurl.push(url.replace(/236/g, '736'))
                    })

                    if (!fileurl || !fileurl.length) return msg.reply(process.env.MESSAGE_ERROR)
                    return msg.replyImage({ url: fileurl[Math.floor(Math.random() * fileurl.length)] })
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

            break
        }

        case 'wikimedia': {
            await msg.reply(process.env.MESSAGE_LOAD)
            if (!fullArgs) return msg.reply(process.env.MESSAGE_NOQUERY)

            await axios.get('https://commons.wikimedia.org/w/index.php?search=' + fullArgs + '&title=Special:MediaSearch&go=Go&type=image')
                .then(({ data }) => {
                    let fileurl = []
                    let $ = cheerio.load(data)

                    $('.sdms-search-results__list-wrapper > div > a').each(function (a, b) {
                        let url = $(b).find('img').attr('data-src') || $(b).find('img').attr('src')
                        fileurl.push(url)
                    })

                    if (!fileurl || !fileurl.length) return msg.reply(process.env.MESSAGE_ERROR)
                    return msg.replyImage({ url: fileurl[Math.floor(Math.random() * fileurl.length)] })
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

            break
        }

        case 'wikipedia': {
            await msg.reply(process.env.MESSAGE_LOAD)
            if (!fullArgs) return msg.reply(process.env.MESSAGE_NOQUERY)

            await axios.get('https://id.wikipedia.org/wiki/' + fullArgs)
                .then(({ data }) => {
                    let $ = cheerio.load(data)
                    let artikel = $('div.mw-parser-output > p').text()
                    let fileurl = 'https:' + ($('.infobox-image > span > a > img').attr('src') || $('.mw-file-description > img').attr('src'))

                    if (!fileurl || !artikel) return msg.reply(process.env.MESSAGE_ERROR)
                    return msg.replyImage({ url: fileurl }, artikel.replace(/\n/g, '\n\n'))
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

            break
        }

        // ========== [ STICKER ] ========== \\
        case 'sticker': case 'stiker': case 's': {
            let [packname, author] = fullArgs ? fullArgs.split('|') : 'Bot|Whatsapp'.split('|')

            if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
                let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
                let fileurl = await writeExif({ mimetype: 'image', data: file }, { packname, author })

                await msg.replySticker({ url: fileurl })
            } else if (msg.typeCheck.isVideo || msg.typeCheck.isQuotedVideo) {
                let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
                let fileurl = await writeExif({ mimetype: 'video', data: file }, { packname, author })

                await msg.replySticker({ url: fileurl })
            } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command}', prefix + command))

            break
        }

        case 'take': {
            let [packname, author] = fullArgs ? fullArgs.split('|') : 'Bot|Whatsapp'.split('|')

            if (msg.typeCheck.isQuotedSticker) {
                let file = await msg.quoted.download('buffer')
                let fileurl = await writeExif({ mimetype: 'webp', data: file }, { packname, author })

                await msg.replySticker({ url: fileurl })
            } else return msg.reply(process.env.MESSAGE_NOSTICKER.replace('{prefix + command}', prefix + command))

            break
        }

        // ========== [ TOOLS ] ========== \\
        case 'remini': {
            await msg.reply(process.env.MESSAGE_LOAD)

            if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
                let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))

                await axios.post('https://upscaler.zyro.com/v1/ai/image-upscaler', { image_data: 'data:image/jpeg;base64,' + file.toString('base64') })
                    .then(async ({ data }) => {
                        if (!data || !data.upscaled) return msg.reply(process.env.MESSAGE_ERROR)

                        let fileurl = Date.now() + '.jpeg'
                        let filebuffer = Buffer.from(data.upscaled.replace('data:image/JPEG;base64,', ''), 'base64')

                        await fs.writeFileSync(fileurl, filebuffer)
                        return msg.replyImage({ url: fileurl }).then(() => { fs.unlinkSync(fileurl) }).catch(() => { fs.unlinkSync(fileurl) })
                    })
                    .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
            } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command}', prefix + command))

            break
        }

        case 'removebg': {
            await msg.reply(process.env.MESSAGE_LOAD)

            if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
                let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))

                await axios.post('https://backend.zyro.com/v1/ai/remove-background', { image: 'data:image/jpeg;base64,' + file.toString('base64') })
                    .then(async ({ data }) => {
                        if (!data || !data.result) return msg.reply(process.env.MESSAGE_ERROR)

                        let fileurl = Date.now() + '.png'
                        let filebuffer = Buffer.from(data.result.replace('data:image/PNG;base64,', ''), 'base64')

                        await fs.writeFileSync(fileurl, filebuffer)
                        return msg.replyImage({ url: fileurl }).then(() => { fs.unlinkSync(fileurl) }).catch(() => { fs.unlinkSync(fileurl) })
                    })
                    .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })
            } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command}', prefix + command))

            break
        }

        case 'ssweb': {
            await msg.reply(process.env.MESSAGE_LOAD)

            if (!fullArgs || !/https:|http:/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
            await axios.post('https://webscreenshot.vercel.app/api', { format: 'jpeg', full: false, isTweet: false, scale: 1, width: 1200, height: 628, url: fullArgs })
                .then(async ({ data }) => {
                    if (!data || !data.image) return msg.reply(process.env.MESSAGE_ERROR)

                    let fileurl = Date.now() + '.jpeg'
                    let filebuffer = Buffer.from(data.image.replace('data:image/jpeg;base64,', ''), 'base64')

                    await fs.writeFileSync(fileurl, filebuffer)
                    return msg.replyImage({ url: fileurl }).then(() => { fs.unlinkSync(fileurl) }).catch(() => { fs.unlinkSync(fileurl) })
                })
                .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

            break
        }
    }
}