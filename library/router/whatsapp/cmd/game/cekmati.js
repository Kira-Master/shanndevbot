module.exports = {
    category: 'Game',
    callback: async ({ msg }) => {
        let hari = [' Tahun', ' Bulan', ' Minggu', ' Hari', ' Jam', ' Menit', ' Detik']
        return msg.reply(Math.floor(Math.random() * 100) + hari[Math.floor(Math.random() * hari.length)] + ' lagi kamu akan mati')
    }
}