const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const app = express();
const Filter = require("bad-words");
const { generateMessage, generateLocation } = require("./utils/messages");
const { getRoomUsers, getUser, addUser, removeUser ,users} = require("./utils/users");

const port = process.env.PORT || 3000;
const server = http.createServer(app);
const io = socketio(server);
app.set("view engine", "ejs");
app.set("views", `${__dirname}/views`);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("join",{rooms:users});
});
app.get("/chat", (req, res) => {
  res.render("chat");
});

io.on("connection", (socket) => {
  console.log("new websocket connection");
  socket.on("join", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options});
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage(user.username,"Welcome user!"));
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(user.username,`${user.username} has joined!`));
      io.to(user.room).emit('roomuser',{
        room:user.room,
        users:getRoomUsers(user.room)
      })
      callback();
  });


  socket.on("display", (data, callback) => {
    const filter = new Filter();
    if (filter.isProfane(data)) {
      return callback("Profanity is not allowed!");
    }
    const user =getUser(socket.id)
    io.to(user.room).emit("message", generateMessage(user.username,data));
    callback();
  });
  socket.on("location", (loc, callback) => {
    const user=getUser(socket.id)
    io.to(user.room).emit(
      "locationmessage",
      generateLocation(user.username,
        `https://google.com/maps?q=${loc.latitude},${loc.longitude}`
      )
    );
    callback("location shared successfully!");
  });
  socket.on("disconnect", () => {
    const user= removeUser(socket.id)
    if(user){
      io.to(user.room).emit("message", generateMessage(user.username,`${user.username} has left!`));
      io.to(user.room).emit('roomuser',{
        room:user.room,
        users:getRoomUsers(user.room)
      })
    }
  });
});
server.listen(port, () => {
  console.log("listening on port " + port);
});
