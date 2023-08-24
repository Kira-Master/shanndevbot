const express = require('express')
const router = express.Router()

router.get('/', (req, res) => { res.render('index') })
router.post('*', (req, res) => { res.sendStatus(500).json({ error: true, message: 'Halaman tidak ditemukan' }) })

module.exports = router