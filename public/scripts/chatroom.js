$(document).ready(function() {
    const socket = io()

    let partnerId = ''
    let roomname =''

    $('#search-input').focusin(function() {
        $('.persons-search-list').show()
        $('.persons-list').hide()
    })

    // $('#search-input').focusout(function() {
    //     $('.persons-search-list').hide()
    //     $('.persons-list').show()
    // })

    $('#search-input').keyup(function() {
        if($(this).val() == '') {
            $('.persons-search-list').html('')
            $('.persons-search-list').hide()
            $('.persons-list').show()
        } else {
            socket.emit('chat search', { search : $(this).val() })
        }
    })

    socket.on('chat search result', (data) => {
        let searchResult = ''

        data.users.forEach(user => {
            searchResult += `
                <li class="item" data-user-id="${user._id}">
                    <div>
                    <div class="profile-picture-container">
                        <img src="/images/profile.png" alt="">
                    </div>
                    <div class="profile-details">
                        <span class="username">@${user.login}</span>
                    </div>
                    </div>
                </li>
            `
        })

        $('.persons-search-list').html(searchResult)
    })

    $(document).on('click', '.item', function() {
        const userId = $(this).data('user-id')
        socket.emit('open chat', {
            userId : userId
        })
        $('.loader').css({ display : 'flex' })
    })
    
    socket.on('open chat result', data => {
        $('.opened-chat-room').find('.person-name').text(data.partner.login)
        roomname = data.roomname
        partnerId = data.partner._id

        console.log('that\'s it')

        let messages_history = ''

        data.chat.forEach(message => {
            if(message.from.toString() == partnerId.toString()) {
                messages_history += `
                    <p class="from-them">${message.message}</p>
                `   
            } else {
                messages_history += `
                    <p class="from-me">${message.message}</p>
                `
            }

            $('.chat-messages').html(messages_history)
        })

        $('.loader').css({ display : 'none' })
        $('.default-chat-room').hide()
        $('.opened-chat-room').show()
    })

    socket.on('open new chat', data => {
        console.log('chat');
        $('.opened-chat-room').find('.person-name').text(data.partner.login)
        roomname = data.roomname
        partnerId = data.partner._id

        $('.loader').css({ display : 'none' })
        $('.default-chat-room').hide()
        $('.opened-chat-room').show()
    })

    $('.send-message').click(function() {
        const message = $('.message').val()
        socket.emit('new message', {
            roomname : roomname,
            partnerId : partnerId,
            message : message
        })
        $('.message').val('')
    })

    socket.on('new message confirm', (data) => {

    })

    socket.on('new message came', data => {
        if(data.fromId == partnerId) {
            $('.chat-messages').append(`
                <p class="from-them">${data.message}</p>
            `)
        } else {
            $('.chat-messages').append(`
                <p class="from-me">${data.message}</p>
            `)
        }
    })

    socket.on('error_message', (data) => {
        console.log( data.message);
        Lobibox.alert('error', {
            title : data.message,
        })
    })

})