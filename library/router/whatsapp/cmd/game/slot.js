module.exports = {
    category: 'Game',
    callback: async ({ msg }) => {
        let hasilPemain = Math.floor(Math.random() * 75)
        let hasilBandar = Math.floor(Math.random() * 100)

        let menangKalah = (hasilBandar > hasilPemain) ? 'Kalah' : (hasilBandar === hasilPemain) ? 'Imbang' : 'Menang'
        return msg.reply(`${hasilBandar} : ${hasilPemain}\n\nKamu *${menangKalah}* melawan bandar`)
    }
}