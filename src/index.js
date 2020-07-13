const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const chalk = require('chalk')

const {generateMessage,generateLocation} = require('./utils/messages')
const {addUser,getUser,removeUser,getUsersInRoom} = require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000

const publicDirPath = path.join(__dirname,'../public')


app.use(express.static(publicDirPath))
app.use(express.json())


io.on('connection', (socket)=>{
    console.log('New socket connection')

    socket.on('join',(options,callback)=>{
        const {error ,user} = addUser({id: socket.id,...options})
        
        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit('newUser', generateMessage('Admin', 'Welcome'))
        socket.broadcast.emit('newUser', generateMessage('Admin',`${user.username} has joined!`))  

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room) 
        })
        
    })

    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        socket.emit('messageMe',generateMessage(user.username,message))
        socket.broadcast.to(user.room).emit('message',generateMessage(user.username,message))
        callback('deliverd!')
    })

    socket.on('sendLocation',(message,callback)=>{
        const user = getUser(socket.id)
        socket.emit('locationMessageMe',generateLocation(user.username,`https://www.google.com/maps?${message.lat},${message.lon}`))
        socket.broadcast.to(user.room).emit('locationMessage',generateLocation(user.username,`https://www.google.com/maps?${message.lat},${message.lon}`))
        callback('Deliverd')
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        console.log(user)
        if(user){
            io.to(user.room).emit('leaveUser',generateMessage('Admin',`${user.username} has left the room!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room) 
            })
        }

        
    })
})

    


server.listen(port,()=>{
    console.log(chalk.bgGreenBright.bold.red('Server is listen on '+port))
})