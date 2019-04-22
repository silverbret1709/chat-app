/*====================================================================================================================
152. Create the chat app project
GOAL : Create Express Web Server
1. Initialize npm and install express
2. Set up new express server
    - Setup the public directory
    - Listen on port 3000
3. Create index.html and render "Chat App" to the screen
4. Test your work

====================================================================================================================*/
const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users');



const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.POST || 3000;
const publicDirectory = path.join(__dirname, '../public');

/*====================================================================================================================
156. Socketio Event Challenge
GOAL : 1- Have server emit "message" when new client connects
2- Have client listen for "message" event and print to console
3- Test your work

## GOAL2 ## Allow clients to send messages
1- Create a form with an input and buton (similar to the weather form)
2- Setup event listener for form submissions
    Emit "sendMessage" with input string as message data
3- Have server listen for "sendMessage"
    -Send message to all connected clients
4- Test your work
====================================================================================================================*/

app.use(express.static(publicDirectory));
io.on('connection', (socket) => {
    console.log("New WebSocket Connection");

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options});
        if (error) {
            return callback(error);
        }
        socket.join(user.room);

        //socket.emit, io.emit, socket.broadcast.emit
        //io.to.emit, socket.broadcast.to.emit

        socket.emit('message', generateMessage('Admin', 'Welcome'));
        // socket.emit("countUpdated", count);
        //
        // socket.on('increment', () => {
        //     count++;
        //     io.emit("countUpdated", count);
        // });


        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined room`));
        io.to(user.room).emit('roomData', {
           room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });



    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback("Profane is not allowed");
        }
        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });


    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`));
            io.to(user.room).emit('roomData', {
               room: user.room,
                users: getUsersInRoom(user.room)
            });
        }

    });

});

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
});


