const users = [];

//addUser, removeUser, getUser, getUserInRoom
const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    //Validate the data
    if (!username || !room) {
        return {
            error: "Username and room are required!"
        }
    }

    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    });

    //Validate username
    if (existingUser) {
        return {
            error: "Username is in use"
        }
    }
    //Store user
    const user = {id, username, room};
    users.push(user);
    return { user }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};
const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
};

const getUsersInRoom = (room) => {
    return users.filter((user) => user.room === room);
}

// addUser({
//     id: 22,
//     username: 'SilverBret',
//     room: '1'
// });
// addUser({
//     id: 23,
//     username: 'SilverBret1',
//     room: '1'
// });
// addUser({
//     id: 24,
//     username: 'SilverBret2',
//     room: '1'
// });
//
// const user = getUser(24);
// console.log(user);
// const allUsers = getUsersInRoom('1');
// console.log(allUsers);

module.exports = {
    addUser,
    getUser,
    getUsersInRoom,
    removeUser
}
