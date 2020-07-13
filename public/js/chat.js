const socket = io()

const $messages = document.querySelector('#messages')           // place of the message display
const $messageForm = document.querySelector('#message-form')    // Message form 
const $messageInput = document.querySelector('#input-message')  // Message Input to send
const $messageSendBtn = document.querySelector('#send')         // button of send message
const $locationBtn = document.querySelector('#send-location')   // To send location


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const messageMeTemplate = document.querySelector('#message-me-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const locationMessageMeTemplate = document.querySelector('#location-message-me-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const newUserTemplate = document.querySelector('#new-user-template').innerHTML
const leaveUserTemplate = document.querySelector('#leave-user-template').innerHTML

//Options 
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix: true})
console.log(room)
//Join chat
socket.emit('join',{username , room},(error)=>{
    if(error){
         alert(error)
        location.href = '/'
    }

})

//Scroll

const autoscroll = ()=>{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight
    }

}


//Print Message
socket.on('newUser',(message)=>{
    console.log(message.username,message.text,moment(message.createdAt).format('hh:mm a'))
    const html = Mustache.render(newUserTemplate,{
        message: message.text,
        time: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('leaveUser',(message)=>{
    console.log(message.username,message.text,moment(message.createdAt).format('hh:mm a'))
    const html = Mustache.render(leaveUserTemplate,{
        message: message.text,
        time: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('message',(message)=>{
    console.log(message.username,message.text,moment(message.createdAt).format('hh:mm a'))
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        time: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('messageMe',(message)=>{
    console.log(message.username,message.text,moment(message.createdAt).format('hh:mm a'))
    const html = Mustache.render(messageMeTemplate,{
        username: message.username,
        message: message.text,
        time: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    const html = Mustache.render(locationMessageTemplate,{
        username: message.username,
        url: message.url,
        time: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessageMe',(message)=>{
    const html = Mustache.render(locationMessageMeTemplate,{
        username: message.username,
        url: message.url,
        time: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//Room Data
socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//When click send Location
$locationBtn.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Your browser doesn\'t support ')
    }

    $locationBtn.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
       
        socket.emit('sendLocation',{
            lat: position.coords.latitude,
            lon: position.coords.longitude
        },()=>{
            $locationBtn.removeAttribute('disabled')
            console.log('location shared!')
        })
    })
})

// when click send 
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageSendBtn.setAttribute('disabled','disabled')
    socket.emit('sendMessage', $messageInput.value,(error)=>{
        $messageSendBtn.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Deliverd!')
    })

})