const sharedSession = require('express-socket.io-session')

const User = require('./models/User')
const Chat = require('./models/Chat')

module.exports = (httpServer, session) => {
    const io = require('socket.io')(httpServer)
    
    io.use(sharedSession(session, {
        autoSave: true
    }))

    io.on('connection', (socket) => {
        console.log('connected user');

        socket.on('chat search', async data => {
            try {
                const users = await User.find({ 
                    login : { 
                        $regex : `^${data.search}.*`
                    }, 
                    _id : {
                        $ne : socket.handshake.session.user._id 
                    }
                }).limit(10)
                socket.emit('chat search result', {users : users})
            } catch(err) {
                socket.emit('error_message', { message : 'Something went wrong, try again later' })
            }
        })

        socket.on('open chat', async (data) => {
            const client = await User.findById(data.userId)
            if(client) {
                const members = [socket.handshake.session.user.login, client.login]
                const roomname = members.sort().join('-')
                const chat = await Chat.find({ 
                    roomname : roomname
                }).limit(30)
                if(chat.length > 0) {
                    socket.join(roomname)
                    socket.emit('open chat result', { partner : client, roomname : roomname, chat : chat })
                } else {
                    socket.join(roomname)
                    socket.emit('open new chat', { partner : client, roomname : roomname })
                }
            } else {
                socket.emit('error_message', { message : 'Some problem with this client' })
            }
        })

        socket.on('new message', async data => {
            if(data.message != '') {
                try {
                    const client = await User.findById(data.partnerId)
                    const members = [socket.handshake.session.user.login, client.login]
                    const roomname = members.sort().join('-')
                    if(client) {
                        await Chat.create({
                            roomname : roomname,
                            from : socket.handshake.session.user._id,
                            to : client._id,
                            message : data.message
                        })
                        io.to(roomname).emit('new message came', {
                            fromId : socket.handshake.session.user._id,
                            from : socket.handshake.session.user.login,
                            message : data.message
                        })
                    } else {
                        socket.emit('error_message', { message : 'Some problem with this client' })
                    }
                } catch(err) {
                    console.log(err);
                    return socket.emit('error_message', { message : 'Something went wrong, try again latera' })
                }
            }
        })
    })
}