let socket = io('http://localhost:8000',
    {
        transports: [
            'websocket',
            'polling',
            'flashsocket'
        ]
    }
)

$('#submit').click(() => {
    let sender = $('#sender').val()
    if (!sender || sender.length <= 5) return swal('Gagal', 'Masukkan nomor dengan benar', 'error')

    $('#submit').text('Loading...')
    setTimeout(() => {
        $('#connection').modal('show')
        $('#logs').removeClass('d-none')
        $('#logs').html('<center><img src="/assets/antrean.png" id="codeqr" width="70%" class="mb-3"><br><span class="badge bg-danger mt-3" id="logs-message">Connecting...</span></center>')
        $('#submit').text('Start')

        socket.emit('whatsapp-connection', sender)
    }, 2000);

})

$('#delete').click(() => {
    let sender = $('#sender').val()
    if (!sender || sender.length <= 5) return swal('Gagal', 'Masukkan nomor dengan benar', 'error')

    $('#delete').text('Loading...')
    setTimeout(() => {
        socket.emit('delete-session', sender)
    }, 2000);
})

socket.on('message', message => {
    $('#logs-message').text(message)
})

socket.on('qr-code', ({ message, result }) => {
    $('#logs-message').text(message)
    $('#codeqr').attr('src', result)
})

socket.on('server-connected', message => {
    $('#logs').addClass('d-none')
    $('#connection').modal('hide')

    swal('Berhasil', message, 'success')
})

socket.on('session-deleted', ({ status, message }) => {
    if (status) {
        swal('Berhasil', message, 'success')
        $('#delete').text('Delete Session')
    } else {
        swal('Gagal', message, 'error')
        $('#delete').text('Delete Session')
    }
})