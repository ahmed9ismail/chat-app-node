const users = []

const addUser = ({id,username,room})=>{
    username = username.trim()
    room = room.trim()

    if(!username || !room){
        return {
            error: 'Please enter username and room'
        }
    }

    const userExisting = users.find((user)=>{
        return user.room.toLowerCase() === room.toLowerCase() && user.username.toLowerCase() === username.toLowerCase()
    })

    if(userExisting){
        return {
            error: 'Username is in use'
        }
    }

    const user = {id,username,room}
    users.push(user)
    return {user}
}

const getUser = (id)=>{
    return users.find((user)=>user.id === id)
} 

const removeUser = (id)=>{
    const userIndex = users.findIndex((user)=>user.id === id)
    
    if(userIndex !== -1){
        return users.splice(userIndex,1)[0]
    }
}

const getUsersInRoom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=>user.room === room)
}

module.exports = {
    addUser,
    getUser,
    removeUser,
    getUsersInRoom
}