const users = [];

const addUser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();
  //validate data
  if (!username || !room) {
    return {
      error: "username and room are requrired!",
    };
  }

  //check for existing user
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  //validate user
  if(existingUser) {
    return {
      error: "username already taken",
    };
  }
  //store user
  const user = { id, username, room };
  users.push(user);
  return {user};
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getRoomUsers = (room) => {
    room = room.trim().toLowerCase();
  const RoomUsers = users.filter((user) => user.room === room);
  if (RoomUsers) {
    return RoomUsers;
  }
};
module.exports={
    addUser,
    removeUser,
    getRoomUsers,
    getUser
}