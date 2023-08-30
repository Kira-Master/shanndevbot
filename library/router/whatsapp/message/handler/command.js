const fs = require('fs')
const axios = require('axios')
const yts = require('yt-search')
const request = require('request')
const cheerio = require('cheerio')
const fetch = require('node-fetch')
const { toAudio, toPTT, toVideo, ffmpeg, sleep } = require('@server/whatsapp/message/handler/converter')
const { downloadMedia, telegraph, uploadFile, bytesToSize, lolhuman } = require('@server/whatsapp/message/handler/myfunc')
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid, writeExif } = require('@server/whatsapp/message/handler/exif')

const _collection = new Map()

module.exports = async ({ client, msg, prefix, args, command }) => {
    let fullArgs = args.join(" ")

    try {
        switch (command) {
            case 'menu': case 'help': case 'list': {
                let menutext = fs.readFileSync('menu.txt', 'utf8')
                await msg.reply(menutext.replace(/{prefix}/g, prefix))

                break
            }

            // ========== [ DOWNLOAD ] ========== \\
            case 'facebook': case 'fb': case 'fbdl': {
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

            case 'instagram': case 'ig': case 'igdl': {
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

            case 'tiktokvideo': case 'tiktokaudio': case 'ttmp4': case 'ttmp3': case 'ttv': case 'tta': {
                await msg.reply(process.env.MESSAGE_LOAD)

                if (!fullArgs || !/https:|https:/.test(fullArgs) || !/tiktok.com/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)

                let formdata = new URLSearchParams({ url: fullArgs })
                await fetch('https://api.tikmate.app/api/lookup', { method: 'POST', body: formdata })
                    .then(async (result) => {
                        let json = await result.json()
                        if (!json || !json.success) return msg.reply(process.env.MESSAGE_ERROR)

                        let fileurl = `https://tikmate.app/download/${json.token}/${json.id}.mp4?hd=1`
                        let filecaption = `*[ TIKTOK DOWNLOAD ]*

• ID : ${json.id}
• Username : ${json.author_id}
• Nickname : ${json.author_name}
• Upload : ${json.create_time}
• Like : ${json.like_count}
• Share : ${json.share_count}
• Comment : ${json.comment_count}

_*Harap tunggu sebentar, permintaan anda akan segera dikirim*_`

                        await msg.replyImage({ url: json.author_avatar }, filecaption)
                        await sleep(2000)

                        if (command === 'ttmp3' || command === 'tta' || command === 'tiktokaudio') return msg.replyAudio({ url: fileurl })
                        if (command === 'ttmp4' || command === 'ttv' || command === 'tiktokvideo') return msg.replyVideo({ url: fileurl })
                    })
                    .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

                break
            }

            case 'twitter': case 'twitterdl': case 'twdl': {
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

            case 'youtubevideo': case 'ytmp4': case 'ytv': {
                await msg.reply(process.env.MESSAGE_LOAD)

                if (!fullArgs || !/https:|http:/.test(fullArgs) || !/youtube.com|youtu.be/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
                let filedata = await lolhuman('ytvideo?url=' + fullArgs)
                if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                let details = await yts({ videoId: filedata.id })
                let caption = `*[ YOUTUBE DOWNLOAD ]*

• ID : ${filedata.id}
• Title : ${filedata.title}
• Size : ${filedata.link.size}
• Quality : ${filedata.link.resolution}
• Duration : ${filedata.duration}
• Upload : ${details.ago}
• Views : ${filedata.view}

_*Harap tunggu sebentar, permintaan anda akan segera dikirim*_`

                await msg.replyImage({ url: filedata.thumbnail }, caption)

                if ((filedata.link.size.split(' ')[1] === 'MB' && parseInt(filedata.link.size.split(' ')[0]) > 100) || (filedata.link.size.split(' ')[1] === 'GB')) {
                    let fileurlnew = await axios.get('https://tinyurl.com/api-create.php?url=' + filedata.link.link)
                    return msg.reply(`*Ukuran file terlalu besar*\nKamu dapat mendownload nya dengan klik link dibawah, link hanya dapat dibuka sekali saja.\n\n${fileurlnew.data}`)
                } else return msg.replyVideo({ url: filedata.link.link })

                break
            }

            case 'youtubeaudio': case 'ytmp3': case 'yta': {
                await msg.reply(process.env.MESSAGE_LOAD)

                if (!fullArgs || !/https:|http:/.test(fullArgs) || !/youtube.com|youtu.be/.test(fullArgs)) return msg.reply(process.env.MESSAGE_NOURL)
                let filedata = await lolhuman('ytaudio?url=' + fullArgs)
                if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                let details = await yts({ videoId: filedata.id })
                let caption = `*[ YOUTUBE DOWNLOAD ]*

• ID : ${filedata.id}
• Title : ${filedata.title}
• Size : ${filedata.link.size}
• Quality : ${filedata.link.bitrate}
• Duration : ${filedata.duration}
• Upload : ${details.ago}
• Views : ${filedata.view}

_*Harap tunggu sebentar, permintaan anda akan segera dikirim*_`

                await msg.replyImage({ url: filedata.thumbnail }, caption)

                if ((filedata.link.size.split(' ')[1] === 'MB' && parseInt(filedata.link.size.split(' ')[0]) > 100) || (filedata.link.size.split(' ')[1] === 'GB')) {
                    let fileurlnew = await axios.get('https://tinyurl.com/api-create.php?url=' + filedata.link.link)
                    return msg.reply(`*Ukuran file terlalu besar*\nKamu dapat mendownload nya dengan klik link dibawah, link hanya bisa dibuka sekali saja.\n\n${fileurlnew.data}`)
                } else return msg.replyAudio({ url: filedata.link.link })

                break
            }

            // ========== [ GABUT ] ========== \\
            case 'asahotak': {
                if (_collection.get(msg.from)) return msg.reply('Masih ada game yang belum kamu selesaikan')

                let data = await lolhuman('tebak/asahotak?')
                if (data.status && data.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                let question = await msg.reply(`[ *ASAH OTAK* ]
            
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

                break
            }

            case 'caklontong': {
                if (_collection.get(msg.from)) return msg.reply('Masih ada game yang belum kamu selesaikan')

                let data = await lolhuman('tebak/caklontong?')
                if (data.status && data.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                let question = await msg.reply(`[ *CAK LONTONG* ]
            
Jawablah pertanyaan di bawah ini
${data.question}

Waktu: 45 detik`)
                _collection.set(msg.from, question)

                msg.createMessageCollector({ filter: data.answer.toLowerCase(), max: 1, time: 45000 })
                    .on('collect', msg => { msg.reply(`Jawaban benar\nJawaban : *${data.answer}*`) })
                    .on('end', res => {
                        _collection.delete(msg.from)

                        if (res == 'timeout') {
                            msg.reply(`Waktu habis...\nJawaban : *${data.answer}*`, question)
                        }
                    })

                break
            }

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

            case 'siapakahaku': {
                if (_collection.get(msg.from)) return msg.reply('Masih ada game yang belum kamu selesaikan')

                let data = await lolhuman('tebak/siapaaku?')
                if (data.status && data.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                let question = await msg.reply(`[ *Siapa Aku* ]
            
${data.question}

Waktu: 45 detik`)
                _collection.set(msg.from, question)

                msg.createMessageCollector({ filter: data.answer.toLowerCase(), max: 1, time: 45000 })
                    .on('collect', msg => { msg.reply(`Jawaban benar\nJawaban : *${data.answer}*`) })
                    .on('end', res => {
                        _collection.delete(msg.from)

                        if (res == 'timeout') {
                            msg.reply(`Waktu habis...\nJawaban : *${data.answer}*`, question)
                        }
                    })

                break
            }

            case 'tebakgambar': {
                if (_collection.get(msg.from)) return msg.reply('Masih ada game yang belum kamu selesaikan')

                let data = await lolhuman('tebak/gambar2?')
                if (data.status && data.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                let question = await msg.replyImage({ url: data.image }, `[ *TEBAK GAMBAR* ]\n\nWaktu : 120 detik`)
                _collection.set(msg.from, question)

                msg.createMessageCollector({ filter: data.answer.toLowerCase(), max: 1, time: 1200000 })
                    .on('collect', msg => { msg.reply(`Jawaban benar\nJawaban : *${data.answer}*`) })
                    .on('end', res => {
                        _collection.delete(msg.from)

                        if (res == 'timeout') {
                            msg.reply(`Waktu habis...\nJawaban : *${data.answer}*`, question)
                        }
                    })

                break
            }

            case 'tebakkata': {
                if (_collection.get(msg.from)) return msg.reply('Masih ada game yang belum kamu selesaikan')

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

                break
            }

            case 'tebaklirik': {
                if (_collection.get(msg.from)) return msg.reply('Masih ada game yang belum kamu selesaikan')

                let data = await lolhuman('tebak/lirik?')
                if (data.status && data.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                let question = await msg.reply(`[ *TEBAK LIRIK* ]
            
Jawablah pertanyaan di bawah ini
${data.question}

Waktu: 45 detik`)
                _collection.set(msg.from, question)

                msg.createMessageCollector({ filter: data.answer.toLowerCase(), max: 1, time: 45000 })
                    .on('collect', msg => { msg.reply(`Jawaban benar\nJawaban : *${data.answer}*`) })
                    .on('end', res => {
                        _collection.delete(msg.from)

                        if (res == 'timeout') {
                            msg.reply(`Waktu habis...\nJawaban : *${data.answer}*`, question)
                        }
                    })

                break
            }

            // ========== [ GROUP ] ========== \\
            case 'add': case 'kick': case 'demote': case 'promote': {
                if (!msg.isGroup || (msg.isGroup && !msg.groupMetadata.participants.filter((v) => v.admin).map((v) => v.id).includes(msg.sender))) return

                await msg.reply(process.env.MESSAGE_LOAD)

                if (!fullArgs) return msg.reply(process.env.MESSAGE_NOQUERY)
                let user = msg.quoted ? msg.quoted.sender : args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'

                if (command === 'add') return await client.groupParticipantsUpdate(msg.from, [user], 'add').then(() => { return msg.react('✅') }).catch(() => { return msg.react('❌') })
                if (command === 'kick') return await client.groupParticipantsUpdate(msg.from, [user], 'remove').then(() => { return msg.react('✅') }).catch(() => { return msg.react('❌') })
                if (command === 'demote') return await client.groupParticipantsUpdate(msg.from, [user], 'demote').then(() => { return msg.react('✅') }).catch(() => { return msg.react('❌') })
                if (command === 'promote') return await client.groupParticipantsUpdate(msg.from, [user], 'promote').then(() => { return msg.react('✅') }).catch(() => { return msg.react('❌') })

                break
            }

            case 'setsubjek': {
                if (!msg.isGroup || (msg.isGroup && !msg.groupMetadata.participants.filter((v) => v.admin).map((v) => v.id).includes(msg.sender))) return
                if (!fullArgs) return msg.reply(process.env.MESSAGE_ERROR)

                return await client.groupUpdateSubject(msg.from, fullArgs).then(() => msg.react('✅')).catch(() => msg.react('❌'))

                break
            }

            case 'setdeskripsi': {
                if (!msg.isGroup || (msg.isGroup && !msg.groupMetadata.participants.filter((v) => v.admin).map((v) => v.id).includes(msg.sender))) return
                if (!fullArgs) return msg.reply(process.env.MESSAGE_ERROR)

                return await client.groupUpdateDescription(msg.from, fullArgs).then(() => msg.react('✅')).catch(() => msg.react('❌'))

                break
            }

            case 'opengroup': case 'closegroup': {
                if (!msg.isGroup || (msg.isGroup && !msg.groupMetadata.participants.filter((v) => v.admin).map((v) => v.id).includes(msg.sender))) return

                let type = command === 'closegroup' ? 'announcement' : 'not_announcement'
                return await client.groupSettingUpdate(msg.from, type).then(() => msg.react('✅')).catch(() => msg.react('❌'))

                break
            }

            case 'leavegroup': {
                if (!msg.isGroup || (msg.isGroup && !msg.groupMetadata.participants.filter((v) => v.admin).map((v) => v.id).includes(msg.sender))) return
                return await client.groupLeave(msg.from)

                break
            }

            case 'linkgroup': {
                if (!msg.isGroup || (msg.isGroup && !msg.groupMetadata.participants.filter((v) => v.admin).map((v) => v.id).includes(msg.sender))) return
                return msg.reply('https://chat.whatsapp.com/' + await client.groupInviteCode(msg.from)).catch(() => msg.react('❌'))

                break
            }

            // ========== [ RANDOM TEXT ] ========== \\
            case 'ceritahorror': {
                await msg.reply(process.env.MESSAGE_LOAD)

                let filedata = await lolhuman('ceritahoror?')
                if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                return msg.replyImage({ url: filedata.thumbnail }, `*[ ${filedata.title} ]*\n\n${filedata.desc}`)
                break
            }

            case 'ceritapendek': case 'cerpen': {
                await msg.reply(process.env.MESSAGE_LOAD)

                let filedata = await lolhuman('cerpen?')
                if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                return msg.reply(`*[ ${filedata.title} ]*\n\n${filedata.cerpen}\n\n- _*${filedata.creator}*_`)
                break
            }

            case 'quotes': {
                await msg.reply(process.env.MESSAGE_LOAD)

                let filedata = await lolhuman('random/quotes?')
                if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                return msg.reply(`${filedata.quote}\n\n- _*${filedata.by}*_`)
                break
            }

            case 'quotesnime': {
                await msg.reply(process.env.MESSAGE_LOAD)

                let filedata = await lolhuman('random/quotesnime?')
                if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                return msg.reply(`${filedata.quote}\n\n- _*${filedata.character}*_`)
                break
            }

            case 'quotesislami': {
                await msg.reply(process.env.MESSAGE_LOAD)

                let filedata = await lolhuman('random/quotesnime?')
                if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                return msg.reply(filedata)
                break
            }

            // ========== [ SEARCH ] ========== \\
            case 'play': {
                await msg.reply(process.env.MESSAGE_LOAD)
                if (!fullArgs) return msg.reply(`Contoh penggunaan:\n${prefix + command} query --options\n\nOptions:\n--doc\n--video`)

                let options = (fullArgs.split(' --')) ? fullArgs.split(' --')[1] : undefined
                let query = (options) ? fullArgs.split(' --')[0] : fullArgs

                let file = await yts({ query })
                if (!file || !file.videos || !file.videos.length) return msg.reply(`Video ${query} tidak ditemukan`)

                let apiurl = options === 'video' ? 'ytvideo?url=https://youtu.be/' + file.videos[0].videoId : 'ytaudio?url=https://youtu.be/' + file.videos[0].videoId
                let data = await lolhuman(apiurl)
                if (data.status && data.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                let caption = `*[ YOUTUBE PLAY ]*

• ID : ${data.id}
• Title : ${data.title}
• Size : ${data.link.size}
• Quality : ${data.link.bitrate}
• Duration : ${data.duration}
• Upload : ${file.videos[0].ago}
• Views : ${data.view}

_*Harap tunggu sebentar, permintaan anda akan segera dikirim*_`

                await msg.replyImage({ url: data.thumbnail }, caption)

                if ((data.link.size.split(' ')[1] === 'MB' && parseInt(data.link.size.split(' ')[0]) > 100) || (data.link.size.split(' ')[1] === 'GB')) {
                    let fileurlnew = await axios.get('https://tinyurl.com/api-create.php?url=' + data.link.link)
                    return msg.reply(`*Ukuran file terlalu besar*\nKamu dapat mendownload nya dengan klik link dibawah, link hanya bisa dibuka sekali saja.\n\n${fileurlnew.data}`)
                } else {
                    if (options === 'doc') return msg.replyDocument({ url: data.link.link }, 'audio/mp3', Date.now() + '.mp3')
                    if (options === 'video') return msg.replyVideo({ url: data.link.link })
                    if (!options) return msg.replyAudio({ url: data.link.link })
                }

                break
            }

            case 'pinterest': case 'pinterestsearch': {
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
            case 'attp': {
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

                break
            }

            case 'sticker': case 'stiker': case 's': case 'stick': {
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

            case 'take': case 'hm': case 'ambil': {
                let [packname, author] = fullArgs ? fullArgs.split('|') : 'Bot|Whatsapp'.split('|')

                if (msg.typeCheck.isQuotedSticker) {
                    let file = await msg.quoted.download('buffer')
                    let fileurl = await writeExif({ mimetype: 'webp', data: file }, { packname, author })

                    await msg.replySticker({ url: fileurl })
                } else return msg.reply(process.env.MESSAGE_NOSTICKER.replace('{prefix + command}', prefix + command))

                break
            }

            case 'ttp': {
                let options = { method: 'POST', url: `https://www.picturetopeople.org/p2p/text_effects_generator.p2p/transparent_text_effect`, headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36", "Cookie": "_ga=GA1.2.1667267761.1655982457; _gid=GA1.2.77586860.1655982457; __gads=ID=c5a896288a559a38-224105aab0d30085:T=1655982456:RT=1655982456:S=ALNI_MbtHcmgQmVUZI-a2agP40JXqeRnyQ; __gpi=UID=000006149da5cba6:T=1655982456:RT=1655982456:S=ALNI_MY1RmQtva14GH-aAPr7-7vWpxWtmg; _gat_gtag_UA_6584688_1=1" }, formData: { 'TextToRender': fullArgs, 'FontSize': '100', 'Margin': '30', 'LayoutStyle': '0', 'TextRotation': '0', 'TextColor': 'ffffff', 'TextTransparency': '0', 'OutlineThickness': '3', 'OutlineColor': '000000', 'FontName': 'Lekton', 'ResultType': 'view' } }
                await request(options, async (error, response, body) => {
                    if (error) return msg.reply(process.env.MESSAGE_ERROR)

                    let $ = cheerio.load(body)
                    let { data } = await axios.get('https://www.picturetopeople.org' + $('.result_img').attr('src'), { responseType: 'arraybuffer' })
                    let fileexif = await writeExifImg(data, { packname: 'Bot', author: 'Whatsapp' })

                    return msg.replySticker({ url: fileexif })
                })

                break
            }

            // ========== [ TEXTMAKER ] ========== \\
            case 'arcade8bit': case 'battlefield4': case 'pubg': case 'ptiktok': {
                await msg.reply(process.env.MESSAGE_LOAD)

                if (!fullArgs) return msg.reply(`Contoh penggunaan:\n${prefix + command} text1|text2`)
                let [text1, text2] = fullArgs.split('|')
                if (!text2) return msg.reply(`Contoh penggunaan:\n${prefix + command} text1|text2`)

                return msg.replyImage({ url: `https://api.lolhuman.xyz/api/photooxy2/${command}?apikey=${process.env.APIKEY}&text1=${text1}&text2=${text2}` }).catch(() => msg.reply(process.env.MESSAGE_ERROR))
                break
            }

            case 'burnpaper': case 'carvedwood': case 'shadow': case 'undergrass': case 'smoke': case 'summernature': case 'coffe': case 'romance': case 'cup': case 'cup1': case 'fallleaves': case 'flamming': case 'golderrose': case 'harrypotter': case 'lovemessage': case 'nature3d': {
                await msg.reply(process.env.MESSAGE_LOAD)

                if (!fullArgs) return msg.reply(`Contoh penggunaan:\n${prefix + command} text`)

                return msg.replyImage({ url: `https://api.lolhuman.xyz/api/photooxy1/${command}?apikey=${process.env.APIKEY}&text=${fullArgs}` }).catch(() => msg.reply(process.env.MESSAGE_ERROR))
                break
            }

            case 'avenger': case 'coolgravity': case 'glitch': case 'marvelstudio': case 'lionlogo': {
                await msg.reply(process.env.MESSAGE_LOAD)

                if (!fullArgs) return msg.reply(`Contoh penggunaan:\n${prefix + command} text1|text2`)
                let [text1, text2] = fullArgs.split('|')
                if (!text2) return msg.reply(`Contoh penggunaan:\n${prefix + command} text1|text2`)

                return msg.replyImage({ url: `https://api.lolhuman.xyz/api/textprome2/${command}?apikey=${process.env.APIKEY}&text1=${text1}&text2=${text2}` }).catch(() => msg.reply(process.env.MESSAGE_ERROR))
                break
            }

            case 'blackpink': case 'sliced': case 'metaldark': case 'luxury': case 'magma': case 'greenneon': case 'halloween': case 'holographic': case 'horrorblood': case 'icecold': case 'impressiveglitch': case 'jokerlogo': case 'bloodfrosted': case 'bokeh': case 'box3d': case 'breakwall': case 'cloud': case 'deluxesilver': case 'fireworksparkle': case 'futureneon': {
                await msg.reply(process.env.MESSAGE_LOAD)

                if (!fullArgs) return msg.reply(`Contoh penggunaan:\n${prefix + command} text`)

                return msg.replyImage({ url: `https://api.lolhuman.xyz/api/textprome/${command}?apikey=${process.env.APIKEY}&text=${fullArgs}` }).catch(() => msg.reply(process.env.MESSAGE_ERROR))
                break
            }

            // ========== [ TOOLS ] ========== \\
            case 'ebase64': case 'dbase64': {
                if (!fullArgs) return msg.reply(process.env.MESSAGE_NOQUERY)
                if (fullArgs.length >= 2048) return msg.reply('Maximal 2.048 String!')

                if (command === 'ebase64') return msg.reply(Buffer.from(fullArgs).toString('base64'))
                if (command === 'dbase64') return msg.reply(Buffer.from(fullArgs, 'base64').toString('ascii'))

                break
            }

            case 'remini': case 'hd': {
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
                } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command} packname|author', prefix + command))

                break
            }

            case 'jadianime': {
                await msg.reply(process.env.MESSAGE_LOAD)

                if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
                    let path = `jadianime-${Date.now()}.jpg`
                    let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
                    await fs.writeFileSync(path, file)

                    let fileurl = await telegraph(path)
                    await fs.unlinkSync(path)

                    return msg.replyImage({ url: `https://api.lolhuman.xyz/api/imagetoanime?img=${fileurl}&apikey=${process.env.APIKEY}` }).catch(() => msg.reply(process.env.MESSAGE_ERROR))

                } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command} packname|author', prefix + command))

                break
            }

            case 'ocr': case 'textreader': {
                await msg.reply(process.env.MESSAGE_LOAD)

                if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
                    let path = `ocr-${Date.now()}.jpg`
                    let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))
                    await fs.writeFileSync(path, file)

                    let fileurl = await telegraph(path)
                    let filedata = await lolhuman('ocr?img=' + fileurl)
                    await fs.unlinkSync(path)

                    if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)
                    return msg.reply(filedata)
                } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command} packname|author', prefix + command))

                break
            }

            case 'removebg': case 'removebackground': {
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
                } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command} packname|author', prefix + command))

                break
            }

            case 'ssweb': case 'screenshootweb': {
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

            case 'shortlink': case 'slink': {
                if (!fullArgs || !fullArgs.startsWith('http')) return msg.reply(`Contoh penggunaan: \n${prefix + command} https://domainku.com\n${prefix + command} https://domainku.com --alias domainku28`)

                let alias = (fullArgs.split(' --alias ')) ? fullArgs.split(' --alias ')[1] : null
                let domain = (fullArgs.split(' --alias ')) ? fullArgs.split(' --alias ')[0] : fullArgs

                await axios.get('https://tinyurl.com/api-create.php?url=' + domain + '&alias=' + alias)
                    .then(({ data }) => { return msg.reply(data) })
                    .catch(() => { return msg.reply(process.env.MESSAGE_ERROR) })

                break
            }

            case 'shortlink2': case 'shortlink3': {
                if (!fullArgs || !fullArgs.startsWith('http')) return msg.reply(`Contoh penggunaan: \n${prefix + command} https://domainku.com`)

                let data = await lolhuman(command + '?url=' + fullArgs)
                if (data.status && data.status === 500) return msg.reply(process.env.MESSAGE_ERROR)

                return msg.reply(filedata)
                break
            }

            case 'tourl': {
                await msg.reply(process.env.MESSAGE_LOAD)

                if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
                    let path = Date.now() + '.jpg'
                    let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))

                    await fs.writeFileSync(path, file)
                    let filesize = await fs.statSync(path)

                    if ((filesize.size / 1000000) >= 5) {
                        fs.unlinkSync(path)
                        return msg.reply('Maksimal upload 5 MB')
                    } else {
                        let fileurl = await telegraph(path)

                        await fs.unlinkSync(path)
                        return msg.reply(fileurl)
                    }
                } else if (msg.typeCheck.isVideo || msg.typeCheck.isQuotedVideo) {
                    let path = Date.now() + '.mp4'
                    let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))

                    await fs.writeFileSync(path, file)
                    let filesize = await fs.statSync(path)

                    if ((filesize.size / 1000000) >= 5) {
                        fs.unlinkSync(path)
                        return msg.reply('Maksimal upload 5 mb')
                    } else {
                        let fileurl = await telegraph(path)

                        await fs.unlinkSync(path)
                        return msg.reply(fileurl)
                    }
                } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command} packname|author', prefix + command))

                break
            }

            case 'topdf': {
                await msg.reply(process.env.MESSAGE_LOAD)

                if (msg.typeCheck.isImage || msg.typeCheck.isQuotedImage) {
                    let path = Date.now()
                    let file = (await msg.download('buffer') || (msg.quoted && (await msg.quoted.download('buffer'))))

                    await fs.writeFileSync('library/upload/' + path + '.jpg', file)
                    let filedata = await lolhuman('convert2pdf?filename=' + path + '.jpg' + '&file=' + process.env.BASE_URL + 'upload/' + path + '.jpg')

                    if (filedata.status && filedata.status === 500) return msg.reply(process.env.MESSAGE_ERROR)
                    await msg.replyDocument({ url: filedata }, 'application/pdf', path + '.pdf')
                    await fs.unlinkSync('upload/' + path + '.jpg')
                } else return msg.reply(process.env.MESSAGE_NOMEDIA.replace('{prefix + command} packname|author', prefix + command))

                break
            }
        }
    } catch {
        return msg.reply(process.env.MESSAGE_ERROR)
    }
}